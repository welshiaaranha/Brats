import React, { useState, useEffect } from "react"; 
import { useNavigate } from "react-router-dom";

function Upload() {
    const [fileName, setFileName] = useState("No file chosen");
    const [selectedFile, setSelectedFile] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        document.body.style.background = "none";
        return () => {
            document.body.style.background = "url('../public/assets/images/background.png') no-repeat center center";
            document.body.style.backgroundSize = "cover";
        };
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const fileExtension = file.name.split('.').pop().toLowerCase();
            if (fileExtension === 'nii' || fileExtension === 'nii.gz' || fileExtension === 'zip') {
                setFileName(file.name);
                setSelectedFile(file);
                setError(null);
            } else {
                setError('Invalid file format. Please upload a .nii, .nii.gz, or .zip file.');
            }
        } else {
            setFileName("No file chosen");
            setSelectedFile(null);
        }
    };

    const pollPipelineStatus = async (outputDir) => {
        // This is a placeholder for polling logic.
        // You can implement an endpoint to check pipeline status if backend supports it.
        // For now, we simulate a delay.
        return new Promise((resolve) => setTimeout(resolve, 30000)); // wait 30 seconds
    };

    // Poll for JSON report file availability
    const pollForJsonReport = async (url, retries = 10, delay = 3000) => {
        for (let i = 0; i < retries; i++) {
            try {
                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    return data;
                }
            } catch (e) {
                // ignore errors and retry
            }
            await new Promise(resolve => setTimeout(resolve, delay));
        }
        throw new Error('JSON report not available after polling');
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!selectedFile) {
            setError('Please select a file to upload.');
            return;
        }

        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append("file", selectedFile);

        try {
            // Upload file
            const uploadRes = await fetch("http://localhost:5000/upload", {
                method: "POST",
                body: formData,
            });
            const uploadData = await uploadRes.json();
            if (!uploadRes.ok) {
                setError(uploadData.error || 'Upload failed. Please try again.');
                setLoading(false);
                return;
            }

            const inputPath = uploadData.path;
            const modelPath = "backend/unet3d_best.pth"; // Adjust if needed
            const outputDir = "backend/api_output";

            // Run pipeline
            const pipelineRes = await fetch("http://localhost:5000/run_pipeline", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ input_path: inputPath, model_path: modelPath, output_dir: outputDir }),
            });
            const pipelineData = await pipelineRes.json();
            if (!pipelineRes.ok) {
                setError(pipelineData.error || 'Pipeline execution failed.');
                setLoading(false);
                return;
            }

            // Poll or wait for pipeline completion
            await pollPipelineStatus(outputDir);

            // Generate report
            const jsonReportPath = `${outputDir}/scan_enhanced_report.json`;
            const pdfReportPath = `${outputDir}/scan_final_report.pdf`;
            const generateReportRes = await fetch("http://localhost:5000/generate_report", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nifti_path: `${outputDir}/scan.nii.gz`,
                    mask_path: `${outputDir}/pred_mask.nii.gz`,
                    json_report_path: jsonReportPath,
                    pdf_report_path: pdfReportPath,
                    growth_rate: 0.0,
                }),
            });
            const reportData = await generateReportRes.json();
            if (!generateReportRes.ok) {
                setError(reportData.error || 'Report generation failed.');
                setLoading(false);
                return;
            }

            // Fix Windows backslash path issue for URLs
            const jsonFileName = jsonReportPath.split(/[\\/]/).pop();
            const pdfFileName = pdfReportPath.split(/[\\/]/).pop();

            // Poll for JSON report availability and fetch content
            const jsonUrl = `http://localhost:5000/api_output/${jsonFileName}`;
            const jsonData = await pollForJsonReport(jsonUrl);

            // Pass URLs and JSON data to Output page
            navigate("/output", {
                state: {
                    results: {
                        video_url: `http://localhost:5000/api_output/tumor_demo.mp4`,
                        pdf_url: `http://localhost:5000/api_output/${pdfFileName}`,
                        json_data: jsonData,
                    },
                },
            });
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        window.location.href = "/";
    };

    const uploadPageStyle = {
        background: "url('/assets/images/background1.png') no-repeat center center",
        backgroundSize: "cover",
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        overflow: "auto"
    };

    return (
        <div style={uploadPageStyle}>
            <header className="navbar">
                <div className="logo-container">
                    <h1>
                        <span className="neuro">Neuro</span>
                        <span className="scan">Scan</span>
                    </h1>
                </div>
                <nav className="nav-links">
                    <div className="user-icon-container" onClick={() => setShowDropdown(!showDropdown)}>
                        <img src="/assets/images/user-icon.png" alt="User Icon" className="user-icon" />
                        {showDropdown && (
                            <div className="dropdown-menu">
                                <button onClick={handleLogout} className="logout-btn">Logout</button>
                            </div>
                        )}
                    </div>
                </nav>
            </header>

            <div className="upload-container">
                <div className="upload-box">
                    <img src="/assets/images/upload-icon.png" alt="Upload Icon" className="upload-icon" />
                    <h2>UPLOAD YOUR MRI</h2>
                    <form onSubmit={handleUpload}>
                        <div className="file-input-wrapper">
                            <label htmlFor="mriFile" className="file-label">
                                Choose File
                                <input 
                                    type="file" 
                                    id="mriFile" 
                                    name="mriFile" 
                                    accept=".nii, .nii.gz, .zip" 
                                    onChange={handleFileChange}
                                    hidden
                                />
                            </label>
                            <span className="file-name">{fileName}</span>
                        </div>
                        {fileName !== "No file chosen" && (
                            <button type="submit" className="upload-btn" disabled={loading}>
                                {loading ? "Processing..." : "Upload and Predict"}
                            </button>
                        )}
                    </form>
                    {error && <p className="error-message">{error}</p>}
                </div>
            </div>
        </div>
    );
}

export default Upload;
