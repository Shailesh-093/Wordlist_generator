import React, { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
    const [formData, setFormData] = useState({
        name: "",
        birthyear: "",
        mobile: "",
        keywords: "",
        specialChars: "!@#$",
        minLength: 6,
        maxLength: 12,
        includeCaps: false,
        includeNumbers: true,
        includeSpecialChars: true,
        prefix: "",
        suffix: ""
    });
    const [message, setMessage] = useState("");

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const postData = {
            ...formData,
            keywords: formData.keywords.split(",").map(kw => kw.trim()),
            specialChars: formData.specialChars.split("")
        };
        try {
            const response = await axios.post("https://wordlist-generator.onrender.com", postData, {
                responseType: "blob",
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "custom_wordlist.txt");
            document.body.appendChild(link);
            link.click();
            link.remove();
            setMessage("Wordlist generated and downloaded successfully!");
        } catch (error) {
            console.error("Error:", error);
            setMessage("Error generating wordlist.");
        }
    };

    return (
        <div className="app-container">
            <h2 className="title">Custom Wordlist Generator</h2>
            <form onSubmit={handleSubmit} className="form-container">
                <label className="input-label">Name:<input type="text" name="name" value={formData.name} onChange={handleChange} className="input-field" required /></label>
                <label className="input-label">Birth Year:<input type="text" name="birthyear" value={formData.birthyear} onChange={handleChange} className="input-field" required /></label>
                <label className="input-label">Mobile Number:<input type="text" name="mobile" value={formData.mobile} onChange={handleChange} className="input-field" /></label>
                <label className="input-label">Keywords (comma-separated):<input type="text" name="keywords" value={formData.keywords} onChange={handleChange} className="input-field" /></label>
                <label className="input-label">Special Characters:<input type="text" name="specialChars" value={formData.specialChars} onChange={handleChange} className="input-field" /></label>

                <h3>Customization Options:</h3>
                <label className="input-label">Min Length:<input type="number" name="minLength" value={formData.minLength} onChange={handleChange} className="input-field" /></label>
                <label className="input-label">Max Length:<input type="number" name="maxLength" value={formData.maxLength} onChange={handleChange} className="input-field" /></label>
                <label className="input-label">Include Capital Letters:<input type="checkbox" name="includeCaps" checked={formData.includeCaps} onChange={handleChange} /></label>
                <label className="input-label">Include Numbers:<input type="checkbox" name="includeNumbers" checked={formData.includeNumbers} onChange={handleChange} /></label>
                <label className="input-label">Include Special Characters:<input type="checkbox" name="includeSpecialChars" checked={formData.includeSpecialChars} onChange={handleChange} /></label>
                <label className="input-label">Prefix:<input type="text" name="prefix" value={formData.prefix} onChange={handleChange} className="input-field" /></label>
                <label className="input-label">Suffix:<input type="text" name="suffix" value={formData.suffix} onChange={handleChange} className="input-field" /></label>

                <button type="submit" className="submit-button">Generate Wordlist</button>
            </form>
            <p className="message">{message}</p>
        </div>
    );
}

export default App;
