import nibabel as nib
import numpy as np
import sys

def inspect_nifti(file_path):
    try:
        img = nib.load(file_path)
        data = img.get_fdata()
        print(f"File: {file_path}")
        print(f"Shape: {data.shape}")
        print(f"Data type: {data.dtype}")
        print(f"Min value: {np.min(data)}")
        print(f"Max value: {np.max(data)}")
        print(f"Non-zero voxels: {np.count_nonzero(data)}")
        print("-" * 40)
    except Exception as e:
        print(f"Error loading {file_path}: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python inspect_nifti_files.py <nifti_file1> [<nifti_file2> ...]")
        sys.exit(1)
    for file_path in sys.argv[1:]:
        inspect_nifti(file_path)
