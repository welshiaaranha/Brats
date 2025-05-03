import os
import argparse
import SimpleITK as sitk

def dicom_to_nifti(dicom_folder, output_nifti_path):
    reader = sitk.ImageSeriesReader()
    dicom_names = reader.GetGDCMSeriesFileNames(dicom_folder)
    if not dicom_names:
        raise ValueError(f"No DICOM files found in directory {dicom_folder}")
    reader.SetFileNames(dicom_names)
    image = reader.Execute()
    sitk.WriteImage(image, output_nifti_path)
    print(f"Converted DICOM folder {dicom_folder} to NIfTI {output_nifti_path}")

def main():
    parser = argparse.ArgumentParser(description="Convert DICOM folder to NIfTI file")
    parser.add_argument('--dicom_folder', required=True, help='Path to input DICOM folder')
    parser.add_argument('--output_nifti', required=True, help='Path to output NIfTI file')
    args = parser.parse_args()

    dicom_to_nifti(args.dicom_folder, args.output_nifti)

if __name__ == "__main__":
    main()
