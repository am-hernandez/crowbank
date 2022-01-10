import React, { useState, useEffect } from "react";
import { useForm } from "../useForm";
import { ethers } from "ethers";
import addresses from "../blockchain/contract-address.json";
import Bank from "../artifacts/contracts/CrowBank.sol/CrowBank.json";
import Token from "../artifacts/contracts/Murder.sol/Murder.json";

function Teller() {
  const [values, handleChange] = useForm({
    depositAmount: 0,
    withdrawAmount: 0,
  });
  const [bankTotalAssets, setBankTotalAssets] = useState(0);
  const [userTotalAssets, setUserTotalAssets] = useState(0);
  const [userTotalTokens, setUserTotalTokens] = useState(0);
  const [newMint, setNewMint] = useState("");

  async function requestAccount() {
    await window.ethereum.request({ method: "eth_requestAccounts" });
  }

  async function setStateVariables() {
    if (typeof window.ethereum !== "undefined") {
      await requestAccount();
      const provider = new ethers.providers.Web3Provider(
        window.ethereum,
        "any"
      );
      getBankTotalAssets();
      getUserTotalAssets();
      getUserTotalTokens();
    }
  }

  async function handleDeposit() {
    const amount = ethers.utils.parseEther(`${values.depositAmount}`);
    if (typeof window.ethereum !== "undefined") {
      try {
        await requestAccount();
        const provider = new ethers.providers.Web3Provider(
          window.ethereum,
          "any"
        );
        const signer = provider.getSigner();
        const contract = new ethers.Contract(
          addresses.bankcontract,
          Bank.abi,
          signer
        );
        const transaction = await contract.deposit({ value: amount });
        await transaction.wait();
        getBankTotalAssets();
        getUserTotalAssets();
        getUserTotalTokens();
        handleChange({ target: { name: "depositAmount", value: 0 } });
      } catch (err) {
        console.error(err);
      }
    }
  }

  async function handleWithdraw() {
    const amount = ethers.utils.parseEther(`${values.withdrawAmount}`);
    if (typeof window.ethereum !== "undefined") {
      try {
        await requestAccount();
        const provider = new ethers.providers.Web3Provider(
          window.ethereum,
          "any"
        );
        const signer = provider.getSigner();
        const contract = new ethers.Contract(
          addresses.bankcontract,
          Bank.abi,
          signer
        );
        const transaction = await contract.withdraw(
          amount,
          addresses.tokencontract
        );
        const receipt = await transaction.wait();
        const block = await provider.getBlock(receipt.blockNumber);
        const timestamp = new Date(block.timestamp);

        getBankTotalAssets();
        getUserTotalAssets();
        getUserTotalTokens();
        handleChange({ target: { name: "withdrawAmount", value: 0 } });
        listenForNewMint(provider, timestamp);
      } catch (err) {
        console.error(err);
      }
    }
  }

  async function getBankTotalAssets() {
    if (typeof window.ethereum !== "undefined") {
      await requestAccount();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(
        addresses.bankcontract,
        Bank.abi,
        provider
      );
      try {
        const totalAssets = ethers.utils.formatEther(
          await contract.totalAssets()
        );
        setBankTotalAssets(totalAssets);
      } catch (err) {
        console.error("Error: ", err);
      }
    }
  }

  async function getUserTotalAssets() {
    if (typeof window.ethereum !== "undefined") {
      await requestAccount();
      try {
        const provider = new ethers.providers.Web3Provider(
          window.ethereum,
          "any"
        );
        const signer = provider.getSigner();
        const contract = new ethers.Contract(
          addresses.bankcontract,
          Bank.abi,
          signer
        );
        const userTotalAssets = ethers.utils.formatEther(
          await contract.accounts(await signer.getAddress())
        );
        setUserTotalAssets(userTotalAssets);
      } catch (err) {
        console.error(err);
      }
    }
  }

  async function getUserTotalTokens() {
    if (typeof window.ethereum !== "undefined") {
      await requestAccount();
      try {
        const provider = new ethers.providers.Web3Provider(
          window.ethereum,
          "any"
        );
        const signer = provider.getSigner();
        const contract = new ethers.Contract(
          addresses.tokencontract,
          Token.abi,
          signer
        );
        const userTotalTokens = ethers.utils.formatEther(
          await contract.balanceOf(await signer.getAddress())
        );
        setUserTotalTokens(userTotalTokens);
      } catch (err) {
        console.error(err);
      }
    }
  }

  async function listenForNewMint(provider, timestamp) {
    const contract = new ethers.Contract(
      addresses.tokencontract,
      Token.abi,
      provider
    );
    timestamp = new Date(timestamp.setFullYear(timestamp.getFullYear() + 52));
    try {
      contract.on("NewMint", (amount, event) => {
        setNewMint(
          `${ethers.utils.formatEther(
            amount
          )} new MRDR token minted at ${timestamp.toString().slice(0, 24)}`
        );
      });
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    setStateVariables();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div id="teller">
      <h3 id="aumHeading">assets under management:</h3>
      <span>{bankTotalAssets || 0} MATIC</span>
      <div id="tellerForm">
        <div id="depositContainer">
          <label htmlFor="depositAmount">put coin in</label>
          <input
            type="number"
            name="depositAmount"
            value={values.depositAmount}
            onChange={handleChange}
          />
          {values.depositAmount > 0 ? (
            <button id="depositBtn" onClick={handleDeposit}>
              Make Deposit
            </button>
          ) : (
            <button disabled id="depositBtn" onClick={handleDeposit}>
              Make Deposit
            </button>
          )}
        </div>

        <div id="withdrawContainer">
          <label htmlFor="withdrawAmount">get coin out</label>
          <input
            type="number"
            name="withdrawAmount"
            value={values.withdrawAmount}
            onChange={handleChange}
          />
          {values.withdrawAmount > 0 ? (
            <button id="withdrawBtn" onClick={handleWithdraw}>
              Make Withdraw
            </button>
          ) : (
            <button disabled id="withdrawBtn" onClick={handleWithdraw}>
              Make Withdraw
            </button>
          )}
        </div>
      </div>

      <aside>
        <h3>Your Nest</h3>
      </aside>
      <p>MATIC: {userTotalAssets || 0}</p>
      <p>MRDR: {userTotalTokens || 0}</p>
      <p id="eventNewMintMessage">{newMint ? newMint + "!" : ""}</p>
    </div>
  );
}

export default Teller;
