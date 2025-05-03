import React, { useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import "../styles.css";

const Home = () => {
    const [activeTab, setActiveTab] = useState("home"); // "home" or "signin"
    const [isSignup, setIsSignup] = useState(true);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        country: "",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSignup) {
            await handleSignup();
        } else {
            await handleLogin();
        }
    };

    const handleSignup = async () => {
        const { name, email, password, country } = formData;
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await setDoc(doc(db, "users", userCredential.user.uid), { 
                name, 
                email, 
                country 
            });
            
            window.location.href = "/upload";

        } catch (error) {
            alert(error.message);
        }
    };

    const handleLogin = async () => {
        try {
            await signInWithEmailAndPassword(auth, formData.email, formData.password);
            window.location.href = "/upload";
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <div className="home-page">
            {/* Transparent Navbar */}
            <nav className="navbar">
                <div className="navbar-left">
                    <h1 className="nav-logo">
                        <span className="neuro">Neuro</span>
                        <span className="scan">Scan</span>
                    </h1>
                </div>
                <ul className="nav-list">
                    <li 
                        className={`nav-item ${activeTab === "home" ? "active" : ""}`} 
                        onClick={() => setActiveTab("home")}
                    >
                        Home
                    </li>
                    <li 
                        className={`nav-item ${activeTab === "signin" ? "active" : ""}`} 
                        onClick={() => setActiveTab("signin")}
                    >
                        SignIn/SignUp
                    </li>
                    <li 
                        className="nav-item"
                    >
                        About Us
                    </li>
                </ul>
            </nav>

            {/* Main Content */}
            <div className="container">
{activeTab === "home" && (
  <div className="home-content">
    <div className="home-text">
      {/* Subtitle text removed as requested */}
    </div>
  </div>
)}

                {activeTab === "signin" && (
                    <div className="form-box">
                        <h3>{isSignup ? "Get Started" : "Welcome Back"}</h3>
                        <form onSubmit={handleSubmit}>
                            {isSignup && (
                                <input 
                                    type="text" 
                                    name="name" 
                                    placeholder="Full Name" 
                                    value={formData.name} 
                                    onChange={handleChange} 
                                    required 
                                    className="form-input"
                                />
                            )}
                            <input 
                                type="email" 
                                name="email" 
                                placeholder="Email Address" 
                                value={formData.email} 
                                onChange={handleChange} 
                                required 
                                className="form-input"
                            />
                            <input 
                                type="password" 
                                name="password" 
                                placeholder={isSignup ? "Create Password" : "Password"} 
                                value={formData.password} 
                                onChange={handleChange} 
                                required 
                                className="form-input"
                            />
                            {isSignup && (
                                <select 
                                    name="country" 
                                    value={formData.country} 
                                    onChange={handleChange} 
                                    required
                                    className="form-select"
                                >
                                    <option value="" disabled>Select Country</option>
                                    <option value="us">United States</option>
                                    <option value="uk">United Kingdom</option>
                                    <option value="in">India</option>
                                </select>
                            )}
                            <button type="submit" className="submit-btn">
                                {isSignup ? "Create Account" : "Secure Login"}
                            </button>
                        </form>

                        <div className="toggle-container">
                            <button 
                                className={isSignup ? "active" : ""} 
                                onClick={() => setIsSignup(true)}
                            >
                                New User?
                            </button>
                            <button 
                                className={!isSignup ? "active" : ""} 
                                onClick={() => setIsSignup(false)}
                            >
                                Existing User?
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
