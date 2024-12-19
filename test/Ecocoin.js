const { expect } = require("chai");
const hre = require("hardhat");

describe("EcoCoin contract", function () {
    let Token;
    let EcoCoin;
    let owner;
    let addr1;
    let addr2;
    const tokenCap = 100000000; // Maximum token supply
    const tokenBlockReward = 50; // Block reward

    beforeEach(async function () {
        Token = await ethers.getContractFactory("EcoCoin");
        [owner, addr1, addr2] = await hre.ethers.getSigners();

        EcoCoin = await Token.deploy(tokenCap, tokenBlockReward);
        await EcoCoin.mintInitialSupply(70000000); // Adjust as needed
    });

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
        expect(await EcoCoin.owner()).to.equal(owner.address);
        });

        it("Should assign the total supply of tokens to the owner", async function () {
        const ownerBalance = await EcoCoin.balanceOf(owner.address);
        expect(await EcoCoin.totalSupply()).to.equal(ownerBalance);
        });

        it("Should set the max capped supply to the argument provided during deployment", async function () {
        const cap = await EcoCoin.cap();
        expect(Number(hre.ethers.utils.formatEther(cap))).to.equal(tokenCap);
        });

        it("Should set the blockReward to the argument provided during deployment", async function () {
        const blockReward = await EcoCoin.blockReward();
        expect(Number(hre.ethers.utils.formatEther(blockReward))).to.equal(tokenBlockReward);
        });
    });

    describe("Transactions", function () {
        it("Should transfer tokens between accounts", async function () {
        await EcoCoin.transfer(addr1.address, 50);
        const addr1Balance = await EcoCoin.balanceOf(addr1.address);
        expect(addr1Balance).to.equal(50);

        await EcoCoin.connect(addr1).transfer(addr2.address, 50);
        const addr2Balance = await EcoCoin.balanceOf(addr2.address);
        expect(addr2Balance).to.equal(50);
        });

        it("Should fail if sender doesn't have enough tokens", async function () {
        const initialOwnerBalance = await EcoCoin.balanceOf(owner.address);

        await expect(
            EcoCoin.connect(addr1).transfer(owner.address, 1)
        ).to.be.revertedWith("ERC20: transfer amount exceeds balance");

        expect(await EcoCoin.balanceOf(owner.address)).to.equal(initialOwnerBalance);
        });

        it("Should update balances after transfers", async function () {
        const initialOwnerBalance = await EcoCoin.balanceOf(owner.address);

        await EcoCoin.transfer(addr1.address, 100);
        await EcoCoin.transfer(addr2.address, 50);

        const finalOwnerBalance = await EcoCoin.balanceOf(owner.address);
        expect(finalOwnerBalance).to.equal(initialOwnerBalance.sub(150));

        const addr1Balance = await EcoCoin.balanceOf(addr1.address);
        expect(addr1Balance).to.equal(100);

        const addr2Balance = await EcoCoin.balanceOf(addr2.address);
        expect(addr2Balance).to.equal(50);
        });
    });
});
