import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import Navbar from "./Navbar";
import ecoCoinABI from '../EcoCoin.json'; // Import the ABI from the saved JSON file

export default function AddCarbonFootprint() {
    const [carbonEmissions, setCarbonEmissions] = useState(0);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [account, setAccount] = useState(null);

    const ecoCoinAddress = "0x4bFc065fe49110b38555AbC1A602CE6945501851";  // Confirm this address matches your deployment
    const ecoCoinContractABI = ecoCoinABI.abi;  // ABI from the JSON file

    // Check for connected account when the component mounts
    useEffect(() => {
        if (window.ethereum) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            provider.listAccounts().then(accounts => {
                if (accounts.length > 0) {
                    setAccount(accounts[0]);  // Set the first account if available
                }
            });

            // Listen for account changes
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length > 0) {
                    setAccount(accounts[0]);
                } else {
                    setAccount(null); // Handle case when account is disconnected
                }
            });
        }
    }, []);

    const connectWallet = async () => {
        if (window.ethereum) {
            try {
                await window.ethereum.request({ method: "eth_requestAccounts" });
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();
                const userAccount = await signer.getAddress();
                setAccount(userAccount);
            } catch (error) {
                alert("Wallet connection failed. Please try again.");
            }
        } else {
            alert("Please install MetaMask");
        }
    };

    const handleMintEcoCoin = async () => {
        if (!carbonEmissions || carbonEmissions <= 0 || isNaN(carbonEmissions)) {
            alert("Please enter a valid carbon emission amount.");
            return;
        }

        if (!account) {
            alert("Please connect your wallet first.");
            return;
        }

        setLoading(true);
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const ecoCoinContract = new ethers.Contract(ecoCoinAddress, ecoCoinContractABI, signer);

            // Convert emissions to token decimals (assuming 18 decimals)
            const tokenAmount = ethers.utils.parseUnits(carbonEmissions.toString(), 18);
            
            // Mint tokens to the connected user's address
            try {
                const tx = await ecoCoinContract.mint(account, tokenAmount, {
                    gasLimit: 5000000, // Ensure this is a higher limit
                    gasPrice: ethers.utils.parseUnits("20", "gwei"), // Set the gas price
                });
                console.log("Transaction sent:", tx);
                await tx.wait();
                setMessage(`Successfully minted ${carbonEmissions} EcoCoins to your account!`);
            } catch (error) {
                console.error("Error occurred during transaction:", error);
                setMessage(`Error occurred: ${error.message}`);
            }
            
            

            
        } catch (err) {
            console.error("Error minting EcoCoin:", err);
            setMessage(`Error occurred: ${err.message}`);
        }
        setLoading(false);
    };

    return (
        <div className="profileClass" style={{ minHeight: "100vh", color : "white"}}>
            <Navbar />

            <div className="flex flex-col text-center mt-11 md:text-2xl">
                <h1 className="font-bold" style={{ color: "white" }}>Mint EcoCoin</h1>

                {account ? (
                    <div className="mb-5" style={{ color: "white" }}>
                        <h2 className="font-bold">Connected Account</h2>
                        <p>{account}</p>
                    </div>
                ) : (
                    <button onClick={connectWallet} className="btn-connect">
                        Connect Wallet
                    </button>
                )}

                <div className="mt-10">
                    <label className="font-bold" style={{ color: "white" }}>Enter Carbon Emissions: </label>
                    <input
                        type="number"
                        value={carbonEmissions}
                        onChange={(e) => setCarbonEmissions(e.target.value)}
                        className="input-carbon"
                        style={{ color: "black" }}
                    />
                </div>

                <button onClick={handleMintEcoCoin} disabled={loading} className="btn-mint" style={{ color: "white" }}>
                    {loading ? "Minting..." : "Mint EcoCoin"}
                </button>

                {message && <p className="mt-5">{message}</p>}
            </div>
        </div>
    );
}
