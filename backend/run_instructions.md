# Running generate_final_report.py on Another Machine

## Setup

1. Install Python 3.8 or higher.
2. Install required packages:
   ```
   pip install -r requirements.txt
   ```

## Files Needed

- `generate_final_report.py`
- Input NIfTI image file (`scan.nii` or `scan.nii.gz`)
- Predicted mask NIfTI file (`pred_mask.nii.gz`)
- (Optional) pretrained model if running inference separately.

## Running the Script

Run the following command with appropriate paths:

```
python generate_final_report.py --nifti_path path/to/scan.nii.gz --mask_path path/to/pred_mask.nii.gz --json_report_path output_report.json --pdf_report_path output_report.pdf --growth_rate 0.0
```

## Output

- A PDF report with tumor visualizations and metrics.
- An enhanced JSON report with tumor volume and growth rate.

## Integration

- Use the JSON report data in your frontend application.
- Provide the PDF report as a downloadable file.

## Dataset

- No datasets need to be shared for running the report generation script.
- The script requires the input NIfTI image and predicted mask files.
- For inference, the pretrained model and DICOM/NIfTI input data are required (not included here).

## Notes

- Ensure the input files are accessible and paths are correctly specified.
- The script depends on libraries such as nibabel, matplotlib, numpy, and scikit-image.

---
