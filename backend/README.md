# Brain Tumor Detection - Final Version

This folder contains the necessary code and files to run the `generate_final_report.py` script on another machine and integrate it with a frontend application.

## Contents

- `generate_final_report.py`: Script to generate a comprehensive PDF and JSON report from brain tumor NIfTI images and predicted masks.
- `preprocess_dicom_to_nifti.py`: Script to convert DICOM folders to NIfTI files.
- `requirements.txt`: Python dependencies required to run the scripts.
- `unet3d_groupnorm.py`: UNet3D model definition required for inference and report generation.
- `run_instructions.md`: Instructions on how to run the scripts and integrate with frontend.

## Requirements

- Python 3.8 or higher
- Install dependencies using:
  ```
  pip install -r requirements.txt
  ```

## Usage

### Preprocessing (if starting from DICOM)

1. Convert DICOM folder to NIfTI:
   ```
   python preprocess_dicom_to_nifti.py --dicom_folder path/to/dicom_folder --output_nifti path/to/output_scan.nii.gz
   ```

### Report Generation

2. Run the report generation script:
   ```
   python generate_final_report.py --nifti_path path/to/scan.nii.gz --mask_path path/to/pred_mask.nii.gz --json_report_path output_report.json --pdf_report_path output_report.pdf --growth_rate 0.0
   ```

3. The script will generate a PDF report and an enhanced JSON report with tumor volume and visualizations.

## Integration with Frontend

- The generated JSON report can be consumed by the frontend to display tumor metrics.
- The PDF report can be provided as a downloadable file for users.

## Dataset

- No datasets need to be shared for running the report generation or preprocessing scripts.
- The scripts require the input DICOM folders or NIfTI image and predicted mask files.
- For inference, the pretrained model and DICOM/NIfTI input data are required (not included here).

## Notes

- Ensure the input files are accessible and paths are correctly specified.
- The scripts depend on libraries such as nibabel, matplotlib, numpy, scikit-image, SimpleITK, and torch.

---

For any questions or support, please contact the project maintainer.
   python generate_final_report.py --nifti_path path/to/scan.nii.gz --mask_path path/to/pred_mask.nii.gz --json_report_path output_report.json --pdf_report_path output_report.pdf --growth_rate 0.0
  pip install -r requirements.txt


command to run : python final_Version/run_pipeline.py --input_path "D:/major/XYZ/RABIYAA/S4020" --model_path "C:/Users/admin/Desktop/brain_tumor_detection/final_Version/unet3d_best.pth" --output_dir "D:/major/XYZ/RABIYAA/S4020/output"

change the input and output path aswell as model path to your local 