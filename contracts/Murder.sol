// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Murder is ERC20 {
    address private bankContract;

    event NewMint(uint256 amountMinted);

    modifier onlyBank() {
        require(
            msg.sender == bankContract,
            "Only the bank can mint new Tokens!"
        );
        _;
    }

    constructor(address _bankAddress) ERC20("Experience Token", "MRDR") {
        bankContract = _bankAddress;
    }

    function mint(address to, uint256 amount) public onlyBank {
        _mint(to, amount);
        emit NewMint(amount);
    }
}
