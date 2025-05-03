@echo off

REM Automated installation script for brain tumor detection system

echo Creating Python virtual environment...
python -m venv venv
call venv\Scripts\activate

echo Installing dependencies...
pip install -r requirements.txt

echo Checking CUDA/cuDNN compatibility...
python -c "import torch; print(f'PyTorch version: {torch.__version__}'); assert torch.cuda.is_available(), 'CUDA not available!'; print(f'CUDA version: {torch.version.cuda}')"

REM Post-install validation
echo Running system checks...
python -c "import nibabel, torch, SimpleITK; print('All core dependencies loaded successfully')"

echo -------------------------------
echo Installation completed successfully!
echo -------------------------------
echo To run the system:
echo 1. Activate virtual environment: venv\Scripts\activate
echo 2. Follow instructions in run_instructions.md

pause

if errorlevel 1 (
    echo Error occurred during installation
    pause
    exit /b 1
)