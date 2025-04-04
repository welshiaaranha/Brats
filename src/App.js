import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Upload from "./pages/Upload";
import Output from "./pages/Output";
import "./styles.css"; // Import the styles.css file

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/output" element={<Output />} />
      </Routes>
    </Router>
  );
}

export default App;

