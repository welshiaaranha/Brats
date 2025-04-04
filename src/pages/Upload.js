import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles.css";

function Upload() {
    const [fileName, setFileName] = useState("No file chosen");
    const [selectedFile, setSelectedFile] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFileName(file ? file.name : "No file chosen");
        setSelectedFile(file);
    };

    const handleUpload = async (event) => {
        event.preventDefault();
        
        if (!selectedFile) {
            alert("Please select a file before uploading!");
            return;
        }

        const formData = new FormData();
        formData.append("file", selectedFile);

        try {
            const response = await fetch("https://l2-c-three.vercel.app/upload", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("File upload failed");
            }

            const result = await response.json();
            console.log("File uploaded successfully:", result);

            // Redirect to Output.js after successful upload
            navigate("/output", { state: { uploadResult: result } });
        } catch (error) {
            console.error("Error uploading file:", error);
            alert("Upload failed. Please try again.");
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
                                    name="mriFile" 
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
            </div>
        </div>
    );
}

export default Upload;
