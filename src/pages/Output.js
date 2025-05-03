import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles.css";

function Output() {
    const navigate = useNavigate();
    const location = useLocation();
    const results = location.state?.results || {};
    const [showDropdown, setShowDropdown] = useState(false);

    // Filter JSON data to keep only specified keys
    const filterReportData = (data) => {
        if (typeof data !== 'object' || data === null) {
            return data;
        }
        const allowedKeys = ['patient', 'tumor_volume_cubic_mm', 'notes', 'usage'];
        let filtered = {};
        for (const key of allowedKeys) {
            if (key in data) {
                filtered[key] = data[key];
            }
        }
        // Override patient name to constant "John Doe"
        if ('patient' in filtered) {
            filtered['patient'] = "John Doe";
        }
        return filtered;
    };

    const handleLogout = () => {
        navigate("/");
    };

    const outputPageStyle = {
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

    // Function to download PDF report
    const downloadPdf = () => {
        if (results.pdf_url) {
            const link = document.createElement('a');
            link.href = results.pdf_url;
            link.download = 'report.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    // Helper function to render JSON data systematically
    const renderJson = (data) => {
        if (typeof data === 'object' && data !== null) {
            return (
                <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
                    {Object.entries(data).map(([key, value]) => (
                            <li key={key} style={{ marginBottom: '1cm' }}>
                                <strong>{key}:</strong> {typeof value === 'object' ? renderJson(value) : String(value)}
                            </li>
                    ))}
                </ul>
            );
        }
        return String(data);
    };

    return (
        <div style={outputPageStyle}>
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

            <div style={{ display: 'flex', height: 'calc(100vh - 60px)', width: '100vw', fontFamily: 'Arial, sans-serif', marginTop: '60px' }}>
                {/* Left half: Video with transparent box and heading */}
                <div style={{
                    flex: 1,
                    padding: '20px',
                    boxSizing: 'border-box',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    backgroundColor: '#f0f0f0'
                }}>
                    <h2 style={{ marginBottom: '20px', fontWeight: '800', fontFamily: 'Times New Roman, serif' }}>3D Visualization</h2>
                    <div style={{
                        width: '90%',
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: '8px',
                        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        padding: '10px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '70vh'
                    }}>
                        {results.video_url ? (
                            <video
                                src={results.video_url}
                                controls
                                style={{ width: '100%', height: '100%', borderRadius: '6px' }}
                            />
                        ) : (
                            <p>No video available</p>
                        )}
                    </div>
                </div>

                {/* Right half: JSON data and generate report button inside white box with shadow and centered */}
                <div style={{
                    flex: 1,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '20px',
                    boxSizing: 'border-box',
                    backgroundColor: '#fff',
                    borderLeft: '1px solid #ddd',
                }}>
                    <div style={{
                        width: '90%',
                        height: '70vh',
                        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                        borderRadius: '8px',
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        backgroundColor: '#fff',
                    }}>
                        <h2 style={{ marginTop: 0, marginBottom: '20px', textAlign: 'center', fontWeight: '800', fontFamily: 'Times New Roman, serif' }}>Report Data</h2>
                        <div style={{
                        flex: 1,
                        overflowY: 'auto',
                        fontSize: '20px',
                        color: '#333',
                        marginBottom: '20px',
                        fontFamily: 'Times New Roman, serif'
                    }}>
                            {results.json_data ? renderJson(filterReportData(results.json_data)) : <p>No report data available</p>}
                        </div>
                        <button
                            onClick={downloadPdf}
                            style={{
                                padding: '12px 20px',
                                backgroundColor: '#ff6600',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                alignSelf: 'center',
                                boxShadow: '0 3px 8px rgba(255, 102, 0, 0.6)',
                                transition: 'background-color 0.3s ease',
                                width: 'fit-content'
                            }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#e65c00'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#ff6600'}
                            disabled={!results.pdf_url}
                            title={results.pdf_url ? 'Download PDF report' : 'PDF report not available'}
                        >
                            Generate Report
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Output;
