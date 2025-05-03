import os
import shutil
import zipfile
import threading
import subprocess
from flask import Flask, request, jsonify, send_file, send_from_directory
from werkzeug.utils import secure_filename
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
API_OUTPUT_FOLDER = os.path.join(BASE_DIR, 'api_output')

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(API_OUTPUT_FOLDER, exist_ok=True)

ALLOWED_EXTENSIONS = {'nii', 'nii.gz', 'dcm', 'zip'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def extract_zip(file_path, extract_to):
    with zipfile.ZipFile(file_path, 'r') as zip_ref:
        zip_ref.extractall(extract_to)

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        save_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(save_path)
        if filename.endswith('.zip'):
            extract_path = os.path.join(UPLOAD_FOLDER, filename + '_extracted')
            os.makedirs(extract_path, exist_ok=True)
            extract_zip(save_path, extract_path)
            os.remove(save_path)
            return jsonify({'message': 'Zip file uploaded and extracted', 'path': extract_path}), 200
        else:
            return jsonify({'message': 'File uploaded', 'path': save_path}), 200
    else:
        return jsonify({'error': 'File type not allowed'}), 400

def run_subprocess(cmd):
    try:
        subprocess.run(cmd, check=True)
    except subprocess.CalledProcessError as e:
        print(f"Error running command: {e}")

@app.route('/convert_weights', methods=['POST'])
def convert_weights():
    data = request.json
    input_path = data.get('input_path')
    output_path = data.get('output_path')
    if not input_path or not output_path:
        return jsonify({'error': 'input_path and output_path are required'}), 400
    if not os.path.exists(input_path):
        return jsonify({'error': f'Input path {input_path} does not exist'}), 400
    cmd = [
        'python', os.path.join(BASE_DIR, 'convert_weights_batchnorm_to_groupnorm.py'),
        '--input', input_path,
        '--output', output_path
    ]
    thread = threading.Thread(target=run_subprocess, args=(cmd,))
    thread.start()
    return jsonify({'message': 'Weight conversion started', 'output_path': output_path}), 200

@app.route('/preprocess_dicom', methods=['POST'])
def preprocess_dicom():
    data = request.json
    dicom_folder = data.get('dicom_folder')
    output_nifti = data.get('output_nifti')
    if not dicom_folder or not output_nifti:
        return jsonify({'error': 'dicom_folder and output_nifti are required'}), 400
    if not os.path.exists(dicom_folder):
        return jsonify({'error': f'DICOM folder {dicom_folder} does not exist'}), 400
    cmd = [
        'python', os.path.join(BASE_DIR, 'preprocess_dicom_to_nifti.py'),
        '--dicom_folder', dicom_folder,
        '--output_nifti', output_nifti
    ]
    thread = threading.Thread(target=run_subprocess, args=(cmd,))
    thread.start()
    return jsonify({'message': 'DICOM preprocessing started', 'output_nifti': output_nifti}), 200

@app.route('/run_pipeline', methods=['POST'])
def run_pipeline():
    data = request.json
    input_path = data.get('input_path')
    model_path = data.get('model_path')
    output_dir = data.get('output_dir', API_OUTPUT_FOLDER)
    if not input_path or not model_path:
        return jsonify({'error': 'input_path and model_path are required'}), 400

    # If input_path is a zip extracted folder, adjust path if needed
    if input_path.endswith('.zip_extracted'):
        # Check if inside this folder there is a subfolder (e.g. S2010) and use that as input_path
        subfolders = [f.path for f in os.scandir(input_path) if f.is_dir()]
        if len(subfolders) == 1:
            input_path = subfolders[0]

    if not os.path.exists(input_path):
        return jsonify({'error': f'Input path {input_path} does not exist'}), 400
    if not os.path.exists(model_path):
        return jsonify({'error': f'Model path {model_path} does not exist'}), 400
    os.makedirs(output_dir, exist_ok=True)
    cmd = [
        'python', os.path.join(BASE_DIR, 'run_pipeline.py'),
        '--input_path', input_path,
        '--model_path', model_path,
        '--output_dir', output_dir
    ]
    thread = threading.Thread(target=run_subprocess, args=(cmd,))
    thread.start()
    return jsonify({'message': 'Pipeline started', 'output_dir': output_dir}), 200

@app.route('/generate_report', methods=['POST'])
def generate_report():
    data = request.json
    nifti_path = data.get('nifti_path')
    mask_path = data.get('mask_path')
    json_report_path = data.get('json_report_path')
    pdf_report_path = data.get('pdf_report_path')
    growth_rate = data.get('growth_rate', 0.0)
    if not nifti_path or not mask_path or not json_report_path or not pdf_report_path:
        return jsonify({'error': 'nifti_path, mask_path, json_report_path, and pdf_report_path are required'}), 400
    if not os.path.exists(nifti_path):
        return jsonify({'error': f'NIfTI path {nifti_path} does not exist'}), 400
    if not os.path.exists(mask_path):
        return jsonify({'error': f'Mask path {mask_path} does not exist'}), 400

    # Run report generation synchronously
    cmd = [
        'python', os.path.join(BASE_DIR, 'generate_final_report.py'),
        '--nifti_path', nifti_path,
        '--mask_path', mask_path,
        '--json_report_path', json_report_path,
        '--pdf_report_path', pdf_report_path,
        '--growth_rate', str(growth_rate)
    ]
    try:
        subprocess.run(cmd, check=True)
    except subprocess.CalledProcessError as e:
        return jsonify({'error': f'Error generating report: {e}'}), 500

    return jsonify({'message': 'Report generation completed', 'json_report_path': json_report_path, 'pdf_report_path': pdf_report_path}), 200

@app.route('/validate_environment', methods=['GET'])
def validate_environment():
    cmd = ['python', os.path.join(BASE_DIR, 'validate_environment.py')]
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        return jsonify({'output': result.stdout}), 200
    except subprocess.CalledProcessError as e:
        return jsonify({'error': str(e), 'output': e.output}), 500

# Serve static files from api_output folder
@app.route('/api_output/<path:filename>')
def serve_api_output(filename):
    return send_from_directory(API_OUTPUT_FOLDER, filename)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
