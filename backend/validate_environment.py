import sys
import subprocess
import torch
import os

def check_system():
    print("="*40 + " System Report " + "="*40)
    
    # Check Python version
    print(f"Python version: {sys.version}")
    
    # Check CUDA availability
    cuda_available = torch.cuda.is_available()
    print(f"CUDA available: {cuda_available}")
    if cuda_available:
        print(f"CUDA version: {torch.version.cuda}")
        print(f"GPU Device: {torch.cuda.get_device_name(0)}")
    
    # Check path configurations
    print("\n" + "="*40 + " Path Validation " + "="*40)
    required_dirs = [
        'models',
        'input_data',
        'reports'
    ]
    
    for dir in required_dirs:
        exists = os.path.exists(dir)
        if not exists:
            os.makedirs(dir, exist_ok=True)
            print(f"Created missing directory: {dir}")
        status = "Found" if exists else "Created"
        print(f"{dir.ljust(15)}: {status}")

    # Check critical file paths
    print("\n" + "="*40 + " Critical Files " + "="*40)
    critical_files = {
        'model_weights': 'unet3d_best.pth',
        'config': 'run_instructions.md'
    }
    
    for name, path in critical_files.items():
        exists = os.path.exists(path)
        status = "Found" if exists else "Missing"
        print(f"{name.ljust(15)}: {status}")
    
    # Final compatibility check
    print("\n" + "="*40 + " Compatibility Check " + "="*40)
    try:
        import nibabel
        import SimpleITK
        import pydicom
        print("Medical imaging libraries loaded successfully")
    except ImportError as e:
        print(f"Missing dependency: {e}")

if __name__ == "__main__":
    check_system()
    
    # Run PyTorch device check
    print("\n" + "="*40 + " PyTorch Validation " + "="*40)
    try:
        test_tensor = torch.randn(3,3).cuda() if torch.cuda.is_available() else torch.randn(3,3)
        print(f"Tensor operations working on {'GPU' if torch.cuda.is_available() else 'CPU'}")
        
        # Test model loading
        if os.path.exists('unet3d_best.pth'):
            model = torch.load('unet3d_best.pth', map_location='cpu')
            print("Model loaded successfully")
        else:
            print("Model weights not found - check path configuration")
    except Exception as e:
        print(f"PyTorch validation failed: {e}")