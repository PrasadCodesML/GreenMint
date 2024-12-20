// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract EcoCoin is ERC20, Ownable, Pausable {
    // Constructor that accepts initial supply
    constructor(uint256 initialSupply) ERC20("EcoCoin", "ECO") {
        _mint(msg.sender, initialSupply);  // Mint the total supply on deployment
    }

    // Mint function to allow the owner to mint more tokens
    function mint(address to, uint256 amount) public onlyOwner whenNotPaused {
        _mint(to, amount);
    }

    // Burn function to allow users to burn their tokens
    function burn(uint256 amount) public whenNotPaused {
        _burn(msg.sender, amount);
    }

    // Pause function to pause token transfers if needed
    function pause() public onlyOwner {
        _pause();
    }

    // Unpause function to resume token transfers
    function unpause() public onlyOwner {
        _unpause();
    }

    // Override to include the pause functionality in transfers
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
    }
}
