import Navbar from "./Navbar";
import { useEffect, useState } from "react";
import MarketplaceJSON from "../Marketplace.json";
import axios from "axios";
import NFTTile from "./NFTTile";
import "./NFTCard.css"; // Import the card styles

export default function Profile() {
    const [data, updateData] = useState([]);
    const [dataFetched, updateFetched] = useState(false);
    const [address, updateAddress] = useState("0x");
    const [totalPrice, updateTotalPrice] = useState("0");

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
                        owner: i.seller,
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
        <div className="profile-container" style={{ minHeight: "100vh", backgroundColor: "#121212" }}>
            <Navbar />
            <div className="profile-content">
                <div className="text-center mt-11 md:text-2xl text-white">
                    <div className="wallet-info mb-5">
                        <h2 className="font-bold">Wallet Address</h2>
                        <span>{address}</span>
                    </div>
                </div>
                <div className="nft-summary flex justify-center mt-10 md:text-2xl text-white">
                    <div>
                        <h2 className="font-bold">No. of NFTs</h2>
                        <span>{data.length}</span>
                    </div>
                    <div className="ml-20">
                        <h2 className="font-bold">Total Value</h2>
                        <span>{totalPrice} ETH</span>
                    </div>
                </div>
                <div className="nft-section flex flex-col text-center items-center mt-11 text-white">
                    <h2 className="font-bold mb-5">Your NFTs</h2>
                    <div className="nft-grid">
                        {data.map((value, index) => (
                            <NFTTile data={value} key={index} />
                        ))}
                    </div>
                    {data.length === 0 && (
                        <div className="mt-10 text-xl">
                            Oops, No NFT data to display (Are you logged in?)
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}