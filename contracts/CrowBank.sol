// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./Murder.sol";

contract CrowBank {
    mapping(address => uint256) public accounts;

    uint256 lockTime = 2 minutes;

    struct Timelock {
        address client;
        uint256 amount;
        uint32 readyTime;
    }

    Timelock[] public vaults;

    mapping(address => uint256) public clientToVaults;

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

    function _isReady(Timelock storage _vaults) internal view returns (bool) {
        return (_vaults.readyTime <= block.timestamp);
    }

    function createSavings() external payable {
        require(msg.value > 0, "Deposit must be more than 0 MATIC");
        vaults.push(
            Timelock(msg.sender, msg.value, uint32(block.timestamp + lockTime))
        );
        uint256 vaultsId = vaults.length - 1;
        clientToVaults[msg.sender] = vaultsId;
    }

    function emptySavings(address _tokenContract) external {
        uint256 vaultsId = clientToVaults[msg.sender];
        Timelock storage vaultsAccount = vaults[vaultsId];
        require(
            vaultsAccount.amount > 0,
            string(abi.encodePacked("This vault is empty.", vaultsId))
        );
        uint256 amount = vaultsAccount.amount;
        require(
            _isReady(vaultsAccount),
            "It is still too early to withdraw from!"
        );
        vaultsAccount.amount = 0;
        payable(msg.sender).transfer(amount);

        Murder experienceToken = Murder(_tokenContract);
        experienceToken.mint(msg.sender, 10 ether);
    }
}
