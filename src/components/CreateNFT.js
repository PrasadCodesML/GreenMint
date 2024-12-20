import Navbar from "./Navbar";
import { useState } from "react";
import { uploadFileToIPFS, uploadJSONToIPFS } from "../pinata";
import Marketplace from "../Marketplace.json";
import { useLocation } from "react-router";

export default function CreateNFT() {
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

    // Generate image using AI
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
            body: JSON.stringify({ inputs: prompt }),
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

    return (
        <div>
        <Navbar />
        <div className="flex flex-col place-items-center mt-10" id="nftForm">
            <form className=" shadow-md rounded px-8 pt-4 pb-8 mb-4" style={{width : "80%", backgroundColor:"#f0f0f0"}} >
            <h3 className="text-center font-bold text-black-500 mb-8">
                Create an NFT with AI
            </h3>
            {/* AI Prompt Input */}
            <div className="mb-4">
                <label
                className="block text-black-500 text-sm font-bold mb-2"
                htmlFor="prompt"
                >
                Enter Prompt for AI Image Generation
                </label>
                <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="prompt"
                type="text"
                placeholder="Astronaut riding a horse"
                onChange={(e) => setPrompt(e.target.value)}
                value={prompt}
                />
                <button
                onClick={generateImageFromPrompt}
                className="font-bold mt-10 w-full bg-black text-white rounded p-2 shadow-lg hover:bg-[#ECD60D] transition duration-300"
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
            <div className="mb-6">
                <label
                className="block text-black-500 text-sm font-bold mb-2"
                htmlFor="description"
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
                htmlFor="price"
                >
                Price (in ETH)
                </label>
                <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="number"
                placeholder="Min 0.01 ETH"
                step="0.01"
                value={formParams.price}
                onChange={(e) =>
                    updateFormParams({ ...formParams, price: e.target.value })
                }
                />
            </div>
            <div className="text-red-500 text-center">{message}</div>
            <button
                onClick={listNFT}
                className="font-bold mt-10 w-full bg-black text-white rounded p-2 shadow-lg hover:bg-[#ECD60D] transition duration-300"
                id="list-button"
            >
                List NFT
            </button>
            </form>
        </div>
        </div>
    );
    }
