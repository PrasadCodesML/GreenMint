import logo from '../logo_3.png';
import fullLogo from '../full_logo.png';
import styles from './navbar.modules.css';

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useRouteMatch,
  useParams
} from "react-router-dom";
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
function Navbar() {
  const [connected, toggleConnect] = useState(false);
  const [currAddress, updateAddress] = useState("0x");
  const location = useLocation();

  useEffect(() => {
    // Restore connection state on component load
    const savedAddress = localStorage.getItem("connectedAddress");
    if (savedAddress) {
      updateAddress(savedAddress);
      toggleConnect(true);
    }
  }, []);

  async function connectWebsite() {
    try {
      if (!window.ethereum) {
        alert("MetaMask is not installed!");
        return;
      }

      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      if (chainId !== "0x5") {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x5" }],
        });
      }

      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const account = accounts[0];

      // Update state and persist to localStorage
      updateAddress(account);
      localStorage.setItem("connectedAddress", account);
      toggleConnect(true);
    } catch (error) {
      console.error("Error connecting to wallet:", error);
    }
  }

  const navContainer = {
    height: "100px",
    backgroundColor: "#ECD60D",
    width: "100%",
    position: "fixed",
    top: 0,
    padding: "0 30px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    zIndex: 9999,
    borderRadius: "0 0 20px 20px",
  };

  const buttonStyle = {
    padding: "12px 20px",
    backgroundColor: connected ? "#16a34a" : "#2563eb",
    color: "#ffffff",
    fontWeight: "bold",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
  };

  return (
    <div style={navContainer}>
      {/* Logo */}
      <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
        <img src={fullLogo} alt="Logo" width={50} />
        <span style={{ fontWeight: "bold", color: "black", fontSize: "28px" }}>GreenMint NFT</span>
      </Link>

      {/* Navigation Links */}
      <div style={{ display: "flex", alignItems: "center", gap: "30px" }}>
        <Link to="/" style={location.pathname === "/" ? { color: "white", backgroundColor: "#060507", padding: "12px 20px", borderRadius: "6px" } : { padding: "12px 20px", textDecoration: "none", color: "#333" }}>
          Marketplace
        </Link>
        <Link to="/sellNFT" style={location.pathname === "/sellNFT" ? { color: "white", backgroundColor: "#060507", padding: "12px 20px", borderRadius: "6px" } : { padding: "12px 20px", textDecoration: "none", color: "#333" }}>
          Upload NFTs
        </Link>
        <Link to="/createNFT" style={location.pathname === "/createNFT" ? { color: "white", backgroundColor: "#060507", padding: "12px 20px", borderRadius: "6px" } : { padding: "12px 20px", textDecoration: "none", color: "#333" }}>
          Create NFTs
        </Link>
        <Link to="/addCarbonFootprints" style={location.pathname === "/addCarbonFootprints" ? { color: "white", backgroundColor: "#060507", padding: "12px 20px", borderRadius: "6px" } : { padding: "12px 20px", textDecoration: "none", color: "#333" }}>
          Add Carbon Footprints
        </Link>
        <Link to="/tradeNFTs" style={location.pathname === "/tradeNFTs" ? { color: "white", backgroundColor: "#060507", padding: "12px 20px", borderRadius: "6px" } : { padding: "12px 20px", textDecoration: "none", color: "#333" }}>
          Trade NFTs
        </Link>
        <Link to="/profile" style={location.pathname === "/profile" ? { color: "white", backgroundColor: "#060507", padding: "12px 20px", borderRadius: "6px" } : { padding: "12px 20px", textDecoration: "none", color: "#333" }}>
          Profile
        </Link>
      </div>

      {/* Connect Wallet Button */}
      <button className="enableEthereumButton" style={buttonStyle} onClick={connectWebsite}>
        {connected ? "Connected" : "Connect Wallet"}
      </button>
    </div>
  );
}

export default Navbar;
