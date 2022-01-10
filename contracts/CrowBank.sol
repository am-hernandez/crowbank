// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./Murder.sol";

contract CrowBank {
    mapping(address => uint256) public accounts;

    constructor() {}

    function totalAssets() external view returns (uint256) {
        return address(this).balance;
    }

    function deposit() external payable {
        require(msg.value > 0, "Deposit must be more than 0 MATIC");
        accounts[msg.sender] += msg.value;
    }

    function withdraw(uint256 _amount, address _tokenContract) external {
        require(
            _amount <= accounts[msg.sender],
            "Cannot withdraw more than deposited."
        );

        accounts[msg.sender] -= _amount;
        payable(msg.sender).transfer(_amount);

        Murder experienceToken = Murder(_tokenContract);
        experienceToken.mint(msg.sender, 1 ether);
    }
}
