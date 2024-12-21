require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
const fs = require('fs');

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    ganache: {
      url: "http://127.0.0.1:7545", // Ganache default RPC server
      chainId: 1337, // Match the Hardhat chain ID or set as per your Ganache setup
      accounts: [
        "0xaf83cb31308c4b1c4d6c3dd6ff07551988fcd6b827123dd4ae42470c5aa1e630",
        // Add more private keys as needed
      ],
    },
  },
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
};
