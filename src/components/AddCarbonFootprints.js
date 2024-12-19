import React, { useState } from "react";
import { ethers } from "ethers";
import Navbar from "./Navbar";

export default function AddCarbonFootprint() {
    const [carbonEmissions, setCarbonEmissions] = useState(0);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [account, setAccount] = useState(null);

    // Owner's address (assuming the coins are already minted to this address)
    const ownerAddress = "0xAf675c9768Ee01C0654cdA6E40DF06d0fCfA6adC";

    // EcoCoin contract address and ABI
    const ecoCoinAddress = "0x4073010b655594E0cf15d4c438e481E70586cf7f";
    const ecoCoinABI = [
        {
            "constant": true,
            "inputs": [{ "name": "account", "type": "address" }],
            "name": "balanceOf",
            "outputs": [{ "name": "", "type": "uint256" }],
            "payable": false,
            "stateMutability": "view",
            "type": "function",
        },
        {
            "constant": false,
            "inputs": [
                { "name": "recipient", "type": "address" },
                { "name": "amount", "type": "uint256" },
            ],
            "name": "transfer",
            "outputs": [{ "name": "", "type": "bool" }],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function",
        },
    ];

    // Connect to Ethereum
    const connectWallet = async () => {
        if (window.ethereum) {
            try {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();
                const userAccount = await signer.getAddress();
                setAccount(userAccount);
                await window.ethereum.request({ method: "eth_requestAccounts" });
            } catch (error) {
                alert("Wallet connection failed. Please try again.");
            }
        } else {
            alert("Please install MetaMask");
        }
    };

    // Handle transferring EcoCoin to the user
        // Handle transferring EcoCoin to the user
    const handleTransferEcoCoin = async () => {
        if (!carbonEmissions || carbonEmissions <= 0) {
            alert("Please enter a valid carbon emission amount.");
            return;
        }

        setLoading(true);
        try {
            // Provider for interacting with the blockchain
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner(); // Use the signer's wallet instead of private key

            const ecoCoinContract = new ethers.Contract(ecoCoinAddress, ecoCoinABI, signer);

            // Get the owner's balance to check if they have enough coins
            const ownerBalance = await ecoCoinContract.balanceOf(ownerAddress);
            if (ownerBalance.lt(ethers.utils.parseUnits(carbonEmissions.toString(), 18))) {
                setMessage("Owner does not have enough EcoCoins to transfer.");
                setLoading(false);
                return;
            }

            // Transfer the carbonEmissions from the owner's address to the user's address
            const tx = await ecoCoinContract.transfer(account, ethers.utils.parseUnits(carbonEmissions.toString(), 18));
            await tx.wait(); // Wait for the transaction to be mined
            setMessage(`Successfully transferred ${carbonEmissions} EcoCoins to your account!`);
        } catch (err) {
            console.error(err);
            setMessage("Error occurred while transferring EcoCoin.");
        }
        setLoading(false);
    };


    return (
        <div className="profileClass" style={{ minHeight: "100vh" }}>
            <Navbar />

            <div className="flex flex-col text-center mt-11 md:text-2xl ">
                <h1 className="font-bold">Mint EcoCoin</h1>

                {account ? (
                    <div className="mb-5">
                        <h2 className="font-bold">Connected Account</h2>
                        <p>{account}</p>
                    </div>
                ) : (
                    <button onClick={connectWallet} className="btn-connect">
                        Connect Wallet
                    </button>
                )}

                <div className="mt-10">
                    <label className="font-bold">Enter Carbon Emissions: </label>
                    <input
                        type="number"
                        value={carbonEmissions}
                        onChange={(e) => setCarbonEmissions(e.target.value)}
                        className="input-carbon"
                    />
                </div>

                <button onClick={handleTransferEcoCoin} disabled={loading} className="btn-mint">
                    {loading ? "Transferring..." : "Transfer EcoCoin"}
                </button>

                {message && <p className="mt-5">{message}</p>}
            </div>
        </div>
    );
}
