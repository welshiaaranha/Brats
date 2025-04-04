import React, { useState, useEffect, useMemo } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import "../styles.css";

const useTypewriter = (words, speed = 100) => {
    const [currentText, setCurrentText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showCursor, setShowCursor] = useState(true);

    // Cursor blink effect
    useEffect(() => {
        const cursorTimer = setInterval(() => {
            setShowCursor(prev => !prev);
        }, 500);
        return () => clearInterval(cursorTimer);
    }, []);

    // Typewriter effect
    useEffect(() => {
        const currentWord = words[currentIndex];
        
        const type = () => {
            if (isDeleting) {
                // Delete character
                setCurrentText(currentWord.substring(0, currentText.length - 1));
            } else {
                // Add character
                setCurrentText(currentWord.substring(0, currentText.length + 1));
            }

            if (!isDeleting && currentText === currentWord) {
                // Pause at end of word
                setTimeout(() => setIsDeleting(true), 1000);
            } else if (isDeleting && currentText === '') {
                // Move to next word after delete
                setIsDeleting(false);
                setCurrentIndex((prev) => (prev + 1) % words.length);
            }
        };

        const timer = setTimeout(type, isDeleting ? speed / 2 : speed);
        return () => clearTimeout(timer);
    }, [currentText, isDeleting, currentIndex, words, speed]);

    return { currentText, showCursor };
};

const Home = () => {
    const [isSignup, setIsSignup] = useState(true);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        country: "",
    });
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [currentWord, setCurrentWord] = useState(0);
    
    const words = useMemo(() => ["Revolutionizing", "Transforming", "Creating"], []);
    const quote = "Pioneering early detection through AI-powered insights";
    const { currentText, showCursor } = useTypewriter(words, 150);
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentWord((prev) => (prev + 1) % words.length);
        }, 3000);
        return () => clearInterval(timer);
    }, [words.length]);

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
            
            setShowSuccessPopup(true);
            setFormData({ name: "", email: "", password: "", country: "" });
            
            const redirectTimer = setTimeout(() => {
                window.location.href = "/upload";
            }, 2000);

            return () => clearTimeout(redirectTimer);

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
        <div className="container">
            {/* Success Popup */}
            {showSuccessPopup && (
                <div className="success-popup">
                    <div className="popup-content">
                        <p>✅ Successfully Registered!</p>
                        <button 
                            className="popup-ok-btn"
                            onClick={() => {
                                setShowSuccessPopup(false);
                                window.location.href = "/upload";
                            }}
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}

            {/* Left Content with Typewriter Effect */}
            <div className="container">
            {/* Left Content with Typewriter Effect */}
            <div className="left-content">
                <div className="logo-container">
                    <img src="../assets/images/logooo.png" alt="Logo" className="logo" />
                    <h1>Neuro<span>Scan</span></h1>
                </div>
                
                <div className="typewriter-container">
                    <h2 className="typewriter">
                        {currentText}
                        <span className={`cursor ${showCursor ? 'visible' : ''}`}>|</span>
                    </h2>
                    <p className="vision-quote">"{quote}"</p>
                </div>

                <button className="learn-more">Explore Features</button>
            </div>

           
        </div>

            {/* Right Side Form */}
            <div className="form-box">
                <h3>{isSignup ? "Get Started" : "Welcome Back"}</h3>
                <form onSubmit={handleSubmit}>
                    {isSignup && (
                        <input type="text" 
                               name="name" 
                               placeholder="Full Name" 
                               value={formData.name} 
                               onChange={handleChange} 
                               required />
                    )}
                    <input type="email" 
                           name="email" 
                           placeholder="Email Address" 
                           value={formData.email} 
                           onChange={handleChange} 
                           required />
                    <input type="password" 
                           name="password" 
                           placeholder="Create Password" 
                           value={formData.password} 
                           onChange={handleChange} 
                           required />
                    {isSignup && (
                        <select name="country" 
                                value={formData.country} 
                                onChange={handleChange} 
                                required>
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
                    <button className={isSignup ? "active" : ""} 
                            onClick={() => setIsSignup(true)}>
                        New User?
                    </button>
                    <button className={!isSignup ? "active" : ""} 
                            onClick={() => setIsSignup(false)}>
                        Existing User?
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Home;