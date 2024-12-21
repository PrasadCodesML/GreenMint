import React, { useState } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import { ethers } from "ethers";
import { uploadFileToIPFS, uploadJSONToIPFS } from "../pinata";
import Marketplace from "../Marketplace.json";
const provider = new ethers.providers.Web3Provider(window.ethereum);
function App() {
    const [formData, setFormData] = useState({
        "Body Type": "obese",
        Sex: "male",
        Diet: "vegan",
        Transport: "public",
        "Vehicle Type": "petrol",
        "Social Activity": "often",
        "Monthly Grocery Bill": "2000",
        "Frequency of Traveling by Air": "rarely",
        "Vehicle Monthly Distance Km": "100",
        "Waste Bag Size": "large",
        "Waste Bag Weekly Count": "5",
        "How Long TV PC Daily Hour": "4",
        "How Many New Clothes Monthly": "3",
        "How Long Internet Daily Hour": "17",
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
            const response = await axios.post("http://192.168.0.121:5000/predict", formData, {
                headers: {
                    "Content-Type": "application/json"
                }
            });
            setPrediction(response.data.carbon_footprint);
        } catch (error) {
            console.error("Error making prediction:", error.response ? error.response.data : error);
        }
    };
    const [formParams, updateFormParams] = useState({
        name: "",
        description: "",
        price: "",
    });
    const [fileURL, setFileURL] = useState(null); // For IPFS URL of image
    const [imageURL, setImageURL] = useState(null); // For displaying generated image
    const [prompt, setPrompt] = useState(""); // For AI prompt input
    const [message, updateMessage] = useState("");
    const ethers = require("ethers");

    const HUGGINGFACE_API_KEY = "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";

    async function disableButton() {
        const listButton = document.getElementById("list-button");
        listButton.disabled = true;
        listButton.style.backgroundColor = "grey";
        listButton.style.opacity = 0.3;
    }

    async function enableButton() {
        const listButton = document.getElementById("list-button");
        listButton.disabled = false;
        listButton.style.backgroundColor = "#A500FF";
        listButton.style.opacity = 1;
    }

    async function generateImageFromPrompt(e) {
        e.preventDefault();
        try {
        updateMessage("Generating image, please wait...");
        const response = await fetch(
            "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell",
            {
            headers: {
                Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
                "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({ inputs: generateNftPrompt(prediction, prompt)}),
            }
        );
        const imageBlob = await response.blob();

        // Convert Blob to File
        const file = new File([imageBlob], "generated-image.png", { type: "image/png" });

        // Upload File to IPFS
        updateMessage("Uploading generated image to IPFS...");
        const ipfsResponse = await uploadFileToIPFS(file);

        if (ipfsResponse.success) {
            setFileURL(ipfsResponse.pinataURL); // Store IPFS URL
            setImageURL(URL.createObjectURL(imageBlob)); // Display generated image
            updateMessage("Image generated and uploaded successfully!");
        } else {
            throw new Error("IPFS upload failed");
        }
        } catch (error) {
        console.error("Error generating or uploading image:", error);
        updateMessage("Failed to generate or upload image. Please try again.");
        }
    }

    // Upload metadata to IPFS
    async function uploadMetadataToIPFS() {
        console.log(formParams)
        const { name, description, price } = formParams;
        if (!name || !description || !price || !fileURL) {
        updateMessage("Please fill all the fields and generate an image!");
        return -1;
        }

        const nftJSON = {
        name,
        description,
        price,
        image: fileURL, // Use the IPFS URL
        };

        try {
        const response = await uploadJSONToIPFS(nftJSON);
        if (response.success) {
            console.log("Uploaded JSON to Pinata:", response);
            return response.pinataURL;
        }
        } catch (error) {
        console.error("Error uploading JSON metadata:", error);
        }
    }

    // List NFT
    async function listNFT(e) {
        e.preventDefault();

        try {
        const metadataURL = await uploadMetadataToIPFS();
        if (metadataURL === -1) return;

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        disableButton();
        updateMessage("Uploading NFT (may take a few minutes)...");

        const contract = new ethers.Contract(Marketplace.address, Marketplace.abi, signer);
        const price = ethers.utils.parseUnits(formParams.price, "ether");
        let listingPrice = await contract.getListPrice();
        listingPrice = listingPrice.toString();

        const transaction = await contract.createToken(metadataURL, price, {
            value: listingPrice,
        });
        await transaction.wait();

        alert("Successfully listed your NFT!");
        enableButton();
        updateMessage("");
        updateFormParams({ name: "", description: "", price: "" });
        setImageURL(null);
        setPrompt("");
        window.location.replace("/");
        } catch (error) {
        console.error("Error listing NFT:", error);
        alert("Failed to list NFT. Please try again.");
        }
    }
    function generateNftPrompt(data, name) {
        let emissionVisual, backgroundTheme;
    
        // Define the emission ranges and their corresponding visuals and themes
        if (data < 600) {
            emissionVisual = "lush green forests filled with vibrant trees, colorful flowers, and serene wildlife like deer, birds, and rabbits. The air is clear, and the sunlight beams through the leaves, symbolizing a sustainable and eco-friendly lifestyle.";
            backgroundTheme = "a peaceful, untouched landscape filled with nature's beauty and eco-friendly elements like solar panels and wind turbines.";
        } else if (600 <= data && data < 1200) {
            emissionVisual = "a vibrant rural landscape with abundant greenery, small farms, and clear skies, where nature thrives alongside sustainable energy sources.";
            backgroundTheme = "a serene village with eco-friendly practices like solar rooftops and windmill farms, coexisting with nature.";
        } else if (1200 <= data && data < 1800) {
            emissionVisual = "a balanced scene of nature and light industry, where small factories and agricultural land coexist with clean energy sources, with some visible smog and emissions.";
            backgroundTheme = "a small industrial town featuring clean factories, wind farms, and green roofs, showing a balance of nature and industry.";
        } else if (1800 <= data && data < 2400) {
            emissionVisual = "an industrialized area with a significant presence of factories, smog, and diminishing green spaces, where the environment is visibly impacted by human activity.";
            backgroundTheme = "a semi-urban area with pollution and industrial structures like smokestacks and power plants, showing the impact of carbon emissions.";
        } else if (2400 <= data && data < 3000) {
            emissionVisual = "a heavily industrialized cityscape with factories, power plants, and polluted rivers, where nature is nearly absent, and the atmosphere is thick with smoke.";
            backgroundTheme = "a polluted industrial city with dark skies, smokestacks, and machinery dominating the landscape.";
        } else if (3000 <= data && data < 3600) {
            emissionVisual = "an urban wasteland filled with large, polluting industries, dead trees, and toxic waste, where the effects of high carbon emissions are visible and oppressive.";
            backgroundTheme = "a toxic industrial city with smokestacks, pollution, and barren land, illustrating the harsh consequences of carbon emissions.";
        } else {
            emissionVisual = "a dystopian world dominated by dark factories emitting thick black smoke, toxic air, and polluted rivers, where the environment is irreversibly damaged by excessive emissions.";
            backgroundTheme = "a bleak, industrial wasteland with endless smog, decaying industrial structures, and a destroyed environment due to excessive emissions.";
        }
    
        // Create the final prompt string
        const prompt = `
        Create an NFT that embeds the name "${name}" on the image and highlights this carbon emission visual in the artwork.
        The scene features ${emissionVisual}. The background highlights ${backgroundTheme}.
        The artwork should include the text "Carbon Emission: ${data} gCO2" along with the name ${name} embedded in the image, symbolizing the person's carbon impact.
        The artistic style should be futuristic, eco-surrealism, vibrant for low emissions, and darker with high detail for higher emissions. Ensure the artwork conveys the impact of ${data['CarbonEmission']} carbon emissions through visual storytelling, with the name "${name}" subtly incorporated into the design as an independent element.
    `;


    
        return prompt.trim();
    }
    
    // Example usage:
    // const data = { 'CarbonEmission': 1500 };
    // const name = "John Doe";
    // const nftPrompt = generateNftPrompt(data, name);
    // console.log(nftPrompt);
    
    return (
        <div style={{ fontFamily: "Arial, sans-serif", backgroundColor: "#000", color: "#fff", minHeight: "100vh" }}>
            <Navbar />
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: "20px",
                    marginTop: "20px", // Adjust this to match Navbar height
                }}
            >
                {/* Input Section */}
                <div
                    style={{
                        backgroundColor: "#f9f9f9",
                        color: "#000",
                        width: "80%",
                        padding: "20px",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    }}
                >
                    <h1 style={{ color: "#000", marginBottom: "20px", textAlign: "center" }} className="text-center font-bold text-black-500 mb-8">Carbon Footprint Predictor</h1>
                    <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                        {Object.keys(formData).map((key) => (
                            <div key={key} style={{ marginBottom: "10px" }}>
                                <label>
                                    <strong>{key}:</strong>
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
                                                marginTop: "5px",
                                                padding: "10px",
                                                width: "100%",
                                                color: "#000",
                                                backgroundColor: "#fff",
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
                                                marginTop: "5px",
                                                padding: "10px",
                                                width: "100%",
                                                color: "#000",
                                                backgroundColor: "#fff",
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
                            className="font-bold mt-10 w-full bg-black text-white rounded p-2 shadow-lg hover:bg-[#ECD60D] transition duration-300"
                            style={{
                                gridColumn: "span 2",
                                padding: "10px 20px",
                                fontSize: "16px",
                                cursor: "pointer",
                                backgroundColor: "#000",
                                color: "#fff",
                                border: "none",
                                borderRadius: "4px",
                                marginTop: "10px",
                            }}
                        >
                            Calculate Footprint
                        </button>
                    </form>
                </div>

                {/* Result Section */}
                {prediction !== null && (
                    <div
                        style={{
                            backgroundColor: "#f9f9f9",
                            color: "#000",
                            width: "80%",
                            marginTop: "20px",
                            padding: "20px",
                            borderRadius: "8px",
                            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                            textAlign: "center",
                        }}
                    >
                        <h2 style={{ color: "#000" }}>Predicted Carbon Footprint:</h2>
                        <p style={{ fontSize: "24px", fontWeight: "bold" }}>{prediction}</p>
                    </div>
                )}
            </div>
            <div>
        
        <div className="flex flex-col text-black-500 place-items-center mt-10 " id="nftForm">
            <form className=" shadow-md rounded px-8 pt-4 pb-8 mb-4" style={{width : "80%", backgroundColor:"#f0f0f0"}} >
            
            {/* AI Prompt Input */}
            <div className="mb-4 text-black-500 ">
            <label
                className="block text-black-500 text-sm font-bold mb-2"
                htmlFor="prompt"
                style={{color:"black"}}
                >
                Enter Keyword
                </label>
                <input
                className="shadow appearance-none text-black-500  border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="prompt"
                type="text"
                placeholder={prediction}
                onChange={(e) => setPrompt(e.target.value)}
                value={prompt}
                />
                <button
                onClick={generateImageFromPrompt}
                className="font-bold mt-10 w-full bg-black text-white rounded p-2 shadow-lg "
                >
                Generate Image
                </button>
            </div>
            {/* Display Generated Image */}
            {imageURL && (
                <div className="mb-4">
                <img
                    src={imageURL}
                    alt="Generated NFT"
                    className="rounded-lg border mt-4"
                />
                </div>
            )}
            {/* NFT Metadata Inputs */}
            <div className="mb-4">
                <label
                className="block text-black-500 text-sm font-bold mb-2"
                htmlFor="name"
                style={{color:"black"}}
                >
                NFT Name
                </label>
                <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="name"
                type="text"
                placeholder="Axie#4563"
                onChange={(e) =>
                    updateFormParams({ ...formParams, name: e.target.value })
                }
                value={formParams.name}
                />
            </div>
            <div className="mb-6 ">
                <label
                className="block text-black-500 text-sm font-bold mb-2"
                htmlFor="description"
                style={{color:"black"}}
                >
                NFT Description
                </label>
                <textarea
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                cols="40"
                rows="5"
                id="description"
                placeholder="Axie Infinity Collection"
                value={formParams.description}
                onChange={(e) =>
                    updateFormParams({ ...formParams, description: e.target.value })
                }
                />
            </div>
            <div className="mb-6">
                <label
                className="block text-black-500 text-sm font-bold mb-2"
                htmlFor="custom"
                style={{color:"black"}}
                >
                Price (in sol)
                </label>
                <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="number"
                placeholder="Min 0.01 ETH"
                value={formParams.price}
                onChange={(e) =>
                    updateFormParams({ ...formParams, price: e.target.value })
                }
                />
            </div>
            <div className="mb-6">
                <label
                className="block text-black-500 text-sm font-bold mb-2"
                htmlFor="price"
                style={{color:"black"}}
                >
                Price (in ETH)
                </label>
                <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="number"
                placeholder={10/prediction}
                value={10/prediction}
                onChange={(e) =>
                    updateFormParams({ ...formParams, price: e.target.value })
                }
                />
            </div>
            <div className="text-red-500 text-center">{message}</div>
            <button
                onClick={listNFT}
                className="font-bold mt-10 w-full bg-black text-white rounded p-2 shadow-lg "
                id="list-button"
            >
                List NFT
            </button>
            </form>
        </div>
        </div>

        </div>
        
    );
}

export default App;