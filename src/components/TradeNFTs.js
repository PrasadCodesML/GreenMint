import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import MarketplaceJSON from "../Marketplace.json";
import axios from "axios";
import "./NFTCard.css";

export default function TradeNFTs() {
    const [data, updateData] = useState([]);
    const [dataFetched, updateFetched] = useState(false);
    const [address, updateAddress] = useState("0x");
    const [totalPrice, updateTotalPrice] = useState("0");

    // Predefined demo offers
    const offers = [
        { id: 1, reward: "2% lower interest on home loan", threshold: 5 },
        { id: 2, reward: "10% cashback on travel expenses", threshold: 10 },
        { id: 3, reward: "Free credit score check for 1 year", threshold: 2 },
        { id: 4, reward: "15% off on online shopping", threshold: 0.01 },
        { id: 5, reward: "Free movie tickets every month", threshold: 0.1 },
        { id: 6, reward: "20% discount on dining", threshold: 3 },
        { id: 7, reward: "Exclusive access to premium events", threshold: 12 },
        { id: 8, reward: "Free gym membership for a year", threshold: 7 },
        { id: 9, reward: "Priority customer support", threshold: 0.4 },
        { id: 10, reward: "Early access to new product launches", threshold: 18 },
    ];

    async function getNFTData() {
        try {
            const ethers = require("ethers");
            let sumPrice = 0;

            // Initialize provider and signer
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();

            // Fetch the connected wallet address
            const addr = await signer.getAddress();
            updateAddress(addr);

            // Fetch the contract instance
            const contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer);

            // Get the user's NFTs
            const transaction = await contract.getMyNFTs();

            const items = await Promise.all(
                transaction.map(async (i) => {
                    const tokenURI = await contract.tokenURI(i.tokenId);
                    const meta = await axios.get(tokenURI).then((res) => res.data);

                    const price = ethers.utils.formatUnits(i.price.toString(), "ether");
                    sumPrice += Number(price);

                    return {
                        price,
                        tokenId: i.tokenId.toNumber(),
                        seller: i.seller,
                        owner: i.owner,
                        image: meta.image,
                        name: meta.name,
                        description: meta.description,
                    };
                })
            );

            updateData(items);
            updateFetched(true);
            updateTotalPrice(sumPrice.toPrecision(3));
        } catch (error) {
            console.error("Error fetching NFT data:", error);
        }
    }

    useEffect(() => {
        if (!dataFetched) {
            getNFTData();
        }
    }, [dataFetched]);

    return (
        <div className="trade-container" style={{ minHeight: "100vh", backgroundColor: "#121212" }}>
            <Navbar />
            <div className="trade-content">
                <div className="text-center mt-11 md:text-2xl text-white">
                    <h2 className="font-bold mb-5">Your NFTs</h2>
                    <p className="text-gray-400">Wallet Address: {address}</p>
                </div>

                <div className="nft-summary flex justify-center mt-10 md:text-2xl text-white">
                    <div>
                        <h2 className="font-bold">Total NFTs Owned</h2>
                        <span>{data.length}</span>
                    </div>
                    <div className="ml-20">
                        <h2 className="font-bold">Total Value</h2>
                        <span>{totalPrice} ETH</span>
                    </div>
                </div>

                

                <div className="offers-section text-center mt-10 text-white">
                    <h3 className="font-bold mb-5">Available Offers</h3>
                    <div className="offers-grid flex flex-col items-center">
                        {offers.map((offer) => (
                            <div
                                key={offer.id}
                                className="offer-card p-4 mb-4 bg-gray-800 rounded-md text-white"
                                style={{
                                    width: "80%",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                }}
                            >
                                <div className="offer-details">
                                    <span className="offer-reward font-bold">{offer.reward}</span>
                                    <p className="offer-price text-gray-400">Price: {offer.threshold} ETH</p>
                                </div>
                                <button
                                    disabled={Number(totalPrice) < offer.threshold}
                                    className={`offer-button p-2 rounded-md ${
                                        Number(totalPrice) >= offer.threshold
                                            ? "bg-yellow-500 text-black"
                                            : "bg-gray-500 text-gray-700 cursor-not-allowed"
                                    }`}
                                >
                                    {Number(totalPrice) >= offer.threshold ? "Claim" : "Insufficient Balance"}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
