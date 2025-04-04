import React from "react";
import { useNavigate } from "react-router-dom";

function Output() {
    const navigate = useNavigate();

    const handleLogout = () => {
        navigate("/");
    };

    return (
        <div style={{ width: "100vw", height: "100vh", backgroundColor: "#0B1C39" }}>
            <header 
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "15px 30px",
                    backgroundColor: "#001f3f", // Changed navbar to blue
                    color: "white",
                    width: "100%",
                    boxSizing: "border-box",
                    borderRadius: "8px"
                }}
            >
                <div style={{ display: "flex", alignItems: "center" }}>
                    <img 
                        src="/assets/images/logooo.png" 
                        alt="Logo" 
                        style={{ width: "60px", marginRight: "15px" }} 
                    />
                    <h1 style={{ fontSize: "28px", margin: "0" }}>
                        Neuro<span style={{ color: "red" }}>Scan</span>
                    </h1>
                </div>
                <nav>
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <img 
                            src="/assets/images/user-icon.png" 
                            alt="User Icon" 
                            style={{ width: "45px", marginRight: "10px" }} 
                        />
                        <button 
                            onClick={handleLogout} 
                            style={{
                                backgroundColor: "transparent",
                                color: "white",
                                border: "none",
                                fontSize: "18px",
                                cursor: "pointer"
                            }}
                        >
                            Logout
                            </button>
                    </div>
                </nav>
            </header>
        </div>
    );
}

export default Output;