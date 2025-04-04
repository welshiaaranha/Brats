import React, { useState } from "react";
import "../styles.css";

function Upload() {
    const [result, setResult] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const [fileName, setFileName] = useState("No file chosen");

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFileName(file ? file.name : "No file chosen");
    };

    const handleUpload = async (event) => {
        event.preventDefault();
        const file = event.target.mriFile.files[0];
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("/predict", {
                method: "POST",
                body: formData
            });
            const data = await response.json();
            setResult(data.result);
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const handleLogout = () => {
        window.location.href = "/";
    };

    return (
        <div>
            <header className="navbar">
                <div className="logo-container">
                    <img src="/assets/images/logooo.png" alt="Logo" className="navbar-logo" />
                    <h1>Neuro<span>Scan</span></h1>
                </div>
                <nav className="nav-links">
                    <div className="user-icon-container" onClick={() => setShowDropdown(!showDropdown)}>
                        <img 
                            src="/assets/images/user-icon.png" 
                            alt="User Icon" 
                            className="user-icon" 
                        />
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
                                    name="file" 
                                    accept="image/*" 
                                    onChange={handleFileChange}
                                    hidden
                                />
                            </label>
                            <span className="file-name">{fileName}</span>
                        </div>
                        {fileName !== "No file chosen" && (
                            <button type="submit" className="upload-btn">Upload and Predict</button>
                        )}
                    </form>
                </div>
                {result && <div className="result-container"><h3>{result}</h3></div>}
                <p className="report-history-text">Check your past report history</p>
            </div>
        </div>
    );
}

export default Upload;