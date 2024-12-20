const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
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

  // Deploy EcoCoin contract with a total cap (100 million tokens)
  const EcoCoin = await ethers.getContractFactory("EcoCoin");
  const totalSupply = ethers.BigNumber.from("100000000").mul(ethers.BigNumber.from("10").pow(18)); // 100M tokens with 18 decimals
  const ecoCoin = await EcoCoin.deploy(totalSupply);
  await ecoCoin.deployed();
  console.log("EcoCoin deployed to:", ecoCoin.address);

  // Mint only 50% of the initial supply to the owner's address
  const halfSupply = totalSupply.div(2);
  await ecoCoin.mint(deployer.address, halfSupply); // Mint 50% to the deployer's address
  console.log("Minted 50% of the total supply to deployer's address");

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
