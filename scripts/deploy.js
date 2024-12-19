const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  // Deploy the NFTMarketplace contract
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy NFTMarketplace
  const Marketplace = await ethers.getContractFactory("NFTMarketplace");
  const marketplace = await Marketplace.deploy();
  await marketplace.deployed();
  console.log("NFTMarketplace deployed to:", marketplace.address);

  // Save the Marketplace contract ABI and address to a JSON file
  const marketplaceData = {
    address: marketplace.address,
    abi: JSON.parse(marketplace.interface.format('json'))
  };
  fs.writeFileSync('./src/Marketplace.json', JSON.stringify(marketplaceData));
  console.log("NFTMarketplace ABI and address saved to ./src/Marketplace.json");

  // Deploy the EcoCoin contract
  const EcoCoin = await ethers.getContractFactory("EcoCoin");
  const ecoCoin = await EcoCoin.deploy(100000000, 50); // Cap: 100M, Block reward: 50
  await ecoCoin.deployed();
  console.log("EcoCoin deployed to:", ecoCoin.address);

  // Mint the full initial supply (100 million tokens)
  await ecoCoin.mintInitialSupply(100000000); // Mint 100M tokens
  console.log("Minted full initial supply of 100 million tokens to owner");

  // Optionally, save EcoCoin contract ABI and address to a file if needed
  const ecoCoinData = {
    address: ecoCoin.address,
    abi: JSON.parse(ecoCoin.interface.format('json'))
  };
  fs.writeFileSync('./src/EcoCoin.json', JSON.stringify(ecoCoinData));
  console.log("EcoCoin ABI and address saved to ./src/EcoCoin.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
