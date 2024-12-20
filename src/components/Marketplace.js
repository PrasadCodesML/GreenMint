import Navbar from "./Navbar";
import NFTTile from "./NFTTile";
import MarketplaceJSON from "../Marketplace.json";
import axios from "axios";
import { useState, useEffect } from "react";
import { GetIpfsUrlFromPinata } from "../utils";
import "./NFTCard.css"; // Import the card design styles

export default function Marketplace() {

    const [data, updateData] = useState([]);
    const [dataFetched, updateFetched] = useState(false);
    const [currAddress, updateCurrAddress] = useState("0x");

    async function getAllNFTs() {
        try {
          const ethers = require("ethers");
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const addr = await signer.getAddress();
          updateCurrAddress(addr);
      
          const contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer);
          const transaction = await contract.getAllNFTs();
      
          console.log("Transaction Data:", transaction); // Debugging log
      
          const items = await Promise.all(
            transaction.map(async (i) => {
              try {
                let tokenURI = await contract.tokenURI(i.tokenId);
                tokenURI = GetIpfsUrlFromPinata(tokenURI);
                const meta = await axios.get(tokenURI);
                const price = ethers.utils.formatUnits(i.price.toString(), "ether");
      
                return {
                  price,
                  tokenId: i.tokenId.toNumber(),
                  seller: i.seller,
                  owner: i.owner,
                  image: meta.data.image,
                  name: meta.data.name,
                  description: meta.data.description,
                };
              } catch (error) {
                console.error("Error fetching token data:", error);
                return null;
              }
            })
          );
      
          const validItems = items.filter((item) => item !== null); // Remove any null items
          console.log("NFT Items:", validItems); // Debugging log
          updateData(validItems);
          updateFetched(true);
        } catch (error) {
          console.error("Error fetching NFTs:", error);
        }
      }
      

    useEffect(() => {
        if (!dataFetched) getAllNFTs();
    }, [dataFetched]);

    return (
        <div>
        <Navbar />
        <div className="marketplace-container">
            <h1 className="title">Top NFTs</h1>
            <div className="nft-grid">
            {data.map((value, index) => (
                <NFTTile data={value} key={index} currAddress={currAddress} />
            ))}
            </div>
        </div>
        </div>
    );
    }
