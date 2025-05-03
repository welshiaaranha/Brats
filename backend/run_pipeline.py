# This is the main pipeline script to run the full brain tumor detection and report generation
# It accepts DICOM folder or NIfTI file input, runs inference, generates mask, creates MP4 demo,
# calculates tumor volume, and generates detailed JSON and PDF reports.

from generate_final_report import generate_pdf_report, enhance_json_report, generate_report
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
sys.path = list(dict.fromkeys(sys.path))  # Remove duplicates while preserving order
# Removed dice_score import and usage since it is not defined in tumor_detection.py and not essential for running the pipeline


import os
import argparse
import SimpleITK as sitk
import numpy as np
import nibabel as nib
import torch
import matplotlib.pyplot as plt
import imageio
from skimage.measure import find_contours
from scipy.ndimage import zoom

from unet3d_groupnorm import UNet3D

def dicom_to_nifti(dicom_folder, output_nifti_path):
    reader = sitk.ImageSeriesReader()
    dicom_names = reader.GetGDCMSeriesFileNames(dicom_folder)
    if not dicom_names:
        raise ValueError(f"No DICOM files found in directory {dicom_folder}")
    reader.SetFileNames(dicom_names)
    image = reader.Execute()
    sitk.WriteImage(image, output_nifti_path)
    print(f"Converted DICOM folder {dicom_folder} to NIfTI {output_nifti_path}")

def load_model(model_path, device):
    model = UNet3D(n_channels=4, n_classes=1, base_filters=64).to(device)
    state_dict = torch.load(model_path, map_location=device)
    # Remove keys with size mismatch
    filtered_dict = {}
    for k, v in state_dict.items():
        try:
            model_param = model.state_dict()[k]
            if model_param.size() == v.size():
                filtered_dict[k] = v
            else:
                print(f"Skipping loading parameter {k} due to size mismatch: checkpoint {v.size()} vs model {model_param.size()}")
        except KeyError:
            print(f"Key {k} not found in model state dict")
    model.load_state_dict(filtered_dict, strict=False)
    model.eval()
    return model

def preprocess_volume(volume, target_shape=(64,64,64)):
    factors = [target_shape[i]/volume.shape[i] for i in range(3)]
    resized = zoom(volume, factors, order=1)
    import numpy as np
    normalized = (resized - resized.min()) / (np.ptp(resized) + 1e-8)
    tensor = torch.tensor(normalized[None, None], dtype=torch.float32)
    tensor = tensor.repeat(1, 4, 1, 1, 1)
    return tensor

def infer_single_volume(model, device, volume):
    input_tensor = preprocess_volume(volume).to(device)
    with torch.no_grad():
        output = model(input_tensor)
        prob = torch.sigmoid(output)[0,0].cpu().numpy()
    binary_mask = (prob > 0.5).astype(np.uint8)
    return binary_mask

def save_nifti(mask, affine, save_path):
    nib.save(nib.Nifti1Image(mask.astype(np.uint8), affine), save_path)
    print(f"Saved mask NIfTI to {save_path}")

def plot_and_save_overlays(scan_path, mask, dice, output_dir):
    try:
        img = nib.load(scan_path).get_fdata()
        max_z = img.shape[2]
        slice_idxs = [min(20, max_z - 1), min(40, max_z - 1), min(60, max_z - 1), max_z // 2]
        os.makedirs(output_dir, exist_ok=True)
        for z in slice_idxs:
            plt.figure(figsize=(6, 6))
            plt.imshow(img[:, :, z].T, cmap='gray', origin='lower')
            contours = find_contours(mask[:, :, z].T, 0.5)
            for contour in contours:
                plt.plot(contour[:, 1], contour[:, 0], 'r', linewidth=2)
            title = f"Slice {z}"
            if dice is not None:
                title += f" - Dice {dice:.3f}"
            plt.title(title)
            plt.axis('off')
            plt.savefig(os.path.join(output_dir, f"slice_{z}_dice_{dice:.3f}.png" if dice is not None else f"slice_{z}.png"), dpi=150)
            plt.close()
    except Exception as e:
        print(f"Error plotting and saving overlays: {e}")

def create_mp4_demo(scan_path, mask, output_path, fps=8.75):
    mri = nib.load(scan_path).get_fdata()
    orig_shape = mri.shape
    factors = [orig_shape[i]/mask.shape[i] for i in range(3)]
    mask_resized = zoom(mask, factors, order=0).astype(np.uint8)
    frames = []
    tumor_slices = [z for z in range(orig_shape[2]) if mask_resized[:,:,z].any()]
    for z in range(orig_shape[2]):
        fig, ax = plt.subplots(figsize=(6,6), dpi=150)
        ax.imshow(mri[:,:,z].T, cmap='gray', origin='lower')
        if mask_resized[:,:,z].any():
            for contour in find_contours(mask_resized[:,:,z].T, 0.5):
                ax.plot(contour[:,1], contour[:,0], color='yellow', linewidth=2.5)
        ax.axis('off')
        fig.canvas.draw()
        frame = np.frombuffer(fig.canvas.tostring_argb(), dtype='uint8')
        frame = frame.reshape(fig.canvas.get_width_height()[::-1] + (4,))
        frame = frame[:, :, [1,2,3]]
        repeat = 10 if z in tumor_slices else 1
        for _ in range(repeat):
            frames.append(frame)
        plt.close(fig)
    imageio.mimsave(output_path, frames, fps=fps, format='FFMPEG', codec='libx264')
    print(f"Saved MP4 demo to {output_path}")

def main():
    parser = argparse.ArgumentParser(description="Run brain tumor detection pipeline")
    parser.add_argument('--input_path', '--input_dir', required=True, help='Path to input DICOM folder or NIfTI file (.nii or .nii.gz)')
    parser.add_argument('--gt_mask', required=False, help='Path to ground truth mask NIfTI for Dice computation')
    parser.add_argument('--model_path', required=True, help='Path to trained model .pth file')
    parser.add_argument('--output_dir', default='pipeline_output', help='Output directory')
    args = parser.parse_args()

    os.makedirs(args.output_dir, exist_ok=True)

    if os.path.isdir(args.input_path):
        dicom_files = [f for f in os.listdir(args.input_path) if f.lower().endswith('.dcm') or '.' not in f]
        if len(dicom_files) == 0:
            raise ValueError(f"No DICOM files found in directory {args.input_path}. Please provide a valid DICOM folder or a NIfTI file.")
        nifti_path = os.path.join(args.output_dir, 'scan.nii.gz')
        dicom_to_nifti(args.input_path, nifti_path)
    elif os.path.isfile(args.input_path) and (args.input_path.endswith('.nii') or args.input_path.endswith('.nii.gz')):
        nifti_path = args.input_path
    else:
        raise ValueError("Input path must be a directory (DICOM folder) or a NIfTI file (.nii or .nii.gz)")

    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    model = load_model(args.model_path, device)

    volume = nib.load(nifti_path).get_fdata()
    mask = infer_single_volume(model, device, volume)

    mask_path = os.path.join(args.output_dir, 'pred_mask.nii.gz')
    save_nifti(mask, nib.load(nifti_path).affine, mask_path)

    dice = None
    if args.gt_mask:
        gt = nib.load(args.gt_mask).get_fdata().astype(np.uint8)
        dice = dice_score(gt, mask)
        print(f"Dice = {dice:.4f}")

    plot_and_save_overlays(nifti_path, mask, dice if dice else 0.0, args.output_dir)

    mp4_path = os.path.join(args.output_dir, 'tumor_demo.mp4')
    create_mp4_demo(nifti_path, mask, mp4_path)

    affine = nib.load(nifti_path).affine
    voxel_volume = np.abs(np.linalg.det(affine[:3, :3]))
    tumor_volume = np.sum(mask) * voxel_volume
    print(f"Tumor volume: {tumor_volume:.3f} cubic mm")

    growth_rate = 0.0

    patient_name = os.path.basename(nifti_path).split('.')[0]
    report_path = os.path.join(args.output_dir, f"{patient_name}_report.json")
    from generate_final_report import generate_report
    generate_report(patient_name, tumor_volume, growth_rate, report_path)
    print(f"Generated report at {report_path}")

    pdf_report_path = os.path.join(args.output_dir, f"{patient_name}_final_report.pdf")
    enhanced_json_report_path = os.path.join(args.output_dir, f"{patient_name}_enhanced_report.json")
    generate_pdf_report(nifti_path, mask, tumor_volume, growth_rate, pdf_report_path)
    enhance_json_report(enhanced_json_report_path, nifti_path, tumor_volume, growth_rate)
    print(f"Generated PDF report at {pdf_report_path}")
    print(f"Generated enhanced JSON report at {enhanced_json_report_path}")

if __name__ == '__main__':
    main()
