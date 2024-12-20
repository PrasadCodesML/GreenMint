import React, { useState } from "react";
import axios from "axios";

function App() {
    const [formData, setFormData] = useState({
        "Body Type": "",
        Sex: "",
        Diet: "",
        Transport: "",
        "Vehicle Type": "",
        "Social Activity": "",
        "Monthly Grocery Bill": "",
        "Frequency of Traveling by Air": "",
        "Vehicle Monthly Distance Km": "",
        "Waste Bag Size": "",
        "Waste Bag Weekly Count": "",
        "How Long TV PC Daily Hour": "",
        "How Many New Clothes Monthly": "",
        "How Long Internet Daily Hour": "",
    });

    const [prediction, setPrediction] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        // Log the inputted data
        console.log("Form Data Submitted:", formData);
    
        try {
            const response = await axios.post("http://192.168.182.61:5000/predict", formData, {
                headers: {
                    "Content-Type": "application/json"
                }
            });
            setPrediction(response.data.carbon_footprint);
        } catch (error) {
            console.error("Error making prediction:", error.response ? error.response.data : error);
        }
    };
    
    return (
        <div style={{ padding: "20px", fontFamily: "Arial, sans-serif", color: "white", backgroundColor: "#333" }}>
            <h1>Carbon Footprint Predictor</h1>
            <form onSubmit={handleSubmit}>
                {Object.keys(formData).map((key) => (
                    <div key={key} style={{ marginBottom: "10px" }}>
                        <label>
                            {key}:
                            {key === "Waste Bag Weekly Count" ||
                              key === "How Long TV PC Daily Hour" ||
                              key === "How Many New Clothes Monthly" ||
                              key === "How Long Internet Daily Hour" ||
                              key === "Monthly Grocery Bill" || 
                              key === "Vehicle Monthly Distance Km" ? (
                                <input
                                    type="number"
                                    name={key}
                                    value={formData[key]}
                                    onChange={handleChange}
                                    style={{
                                        marginLeft: "10px",
                                        padding: "5px",
                                        color: "black",
                                        backgroundColor: "white",
                                        border: "1px solid #ccc",
                                        borderRadius: "4px",
                                    }}
                                />
                            ) : (
                                <select
                                    name={key}
                                    value={formData[key]}
                                    onChange={handleChange}
                                    style={{
                                        marginLeft: "10px",
                                        padding: "5px",
                                        color: "black",
                                        backgroundColor: "white",
                                        border: "1px solid #ccc",
                                        borderRadius: "4px",
                                    }}
                                >
                                    <option value="" disabled>Select {key}</option>
                                    {key === "Body Type" && ['normal', 'obese', 'overweight', 'underweight'].map((option) => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                    {key === "Sex" && ["female", "male"].map((option) => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                    {key === "Diet" && ['omnivore', 'pescatarian', 'vegan', 'vegetarian'].map((option) => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                    {key === "Transport" && ['private', 'public', 'walk/bicycle'].map((option) => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                    {key === "Vehicle Type" && ['None', 'diesel', 'electric', 'hybrid', 'lpg', 'petrol'].map((option) => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                    {key === "Social Activity" && ['never', 'often', 'sometimes'].map((option) => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                    {key === "Frequency of Traveling by Air" && ['frequently', 'never', 'rarely', 'very frequently'].map((option) => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                    {key === "Waste Bag Size" && ['extra large', 'large', 'medium', 'small'].map((option) => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            )}
                        </label>
                    </div>
                ))}
                <button
                    type="submit"
                    style={{
                        padding: "10px 20px",
                        fontSize: "16px",
                        cursor: "pointer",
                        backgroundColor: "#007BFF",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                    }}
                >
                    Calculate Footprint
                </button>
            </form>
            {prediction !== null && (
                <div style={{ marginTop: "20px", color: "white" }}>
                    <h2>Predicted Carbon Footprint:</h2>
                    <p>{prediction}</p>
                </div>
            )}
        </div>
    );
}

export default App;
