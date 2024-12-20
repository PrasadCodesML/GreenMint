import Navbar from "./Navbar";
import { useEffect, useState } from "react";
import MarketplaceJSON from "../Marketplace.json";
import axios from "axios";
import NFTTile from "./NFTTile";

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
        <div className="profileClass" style={{ minHeight: "100vh" }}>
            <Navbar />
            <div className="profileClass">
                <div className="flex text-center flex-col mt-11 md:text-2xl text-white">
                    <div className="mb-5">
                        <h2 className="font-bold">Wallet Address</h2>
                        {address}
                    </div>
                </div>
                <div className="flex flex-row text-center justify-center mt-10 md:text-2xl text-white">
                    <div>
                        <h2 className="font-bold">No. of NFTs</h2>
                        {data.length}
                    </div>
                    <div className="ml-20">
                        <h2 className="font-bold">Total Value</h2>
                        {totalPrice} ETH
                    </div>
                </div>
                <div className="flex flex-col text-center items-center mt-11 text-white">
                    <h2 className="font-bold">Your NFTs</h2>
                    <div className="flex justify-center flex-wrap max-w-screen-xl">
                        {data.map((value, index) => {
                            return <NFTTile data={value} key={index} />;
                        })}
                    </div>
                    <div className="mt-10 text-xl">
                        {data.length === 0 && "Oops, No NFT data to display (Are you logged in?)"}
                    </div>
                </div>
            </div>
        </div>
    );
}
