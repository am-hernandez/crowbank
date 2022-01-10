// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./Murder.sol";

contract CrowBank {
    mapping(address => uint256) public accounts;
    uint256 lockTime = 2 minutes;

    struct Timelock {
        address account;
        uint256 amount;
        uint32 readyTime;
    }

    Timelock[] public savings;

    mapping(address => uint256) public accountToSavings;

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

    function _isReady(Timelock storage _savings) internal view returns (bool) {
        return (_savings.readyTime <= block.timestamp);
    }

    function createSavings() external payable {
        require(msg.value > 0, "Deposit must be more than 0 MATIC");
        savings.push(
            Timelock(msg.sender, msg.value, uint32(block.timestamp + lockTime))
        );
        uint256 savingsId = savings.length - 1;
        accountToSavings[msg.sender] = savingsId;
        accounts[msg.sender] += msg.value;
    }

    function emptySavings(address _tokenContract) external {
        uint256 savingsId = accountToSavings[msg.sender];
        Timelock storage savingsAccount = savings[savingsId];
        require(_isReady(savingsAccount), "It is still too early to withdraw!");
        accounts[msg.sender] -= savingsAccount.amount;
        payable(msg.sender).transfer(savingsAccount.amount);

        Murder experienceToken = Murder(_tokenContract);
        experienceToken.mint(msg.sender, 10 ether);
    }
}
