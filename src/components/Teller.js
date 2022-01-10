import React, { useState, useEffect } from "react";
import { useForm } from "../useForm";
import { ethers } from "ethers";
import addresses from "../blockchain/contract-address.json";
import Bank from "../artifacts/contracts/CrowBank.sol/CrowBank.json";
import Token from "../artifacts/contracts/Murder.sol/Murder.json";
import bird from "../img/bird.png";
import matic from "../img/matic.png";

function Teller() {
  const [values, handleChange] = useForm({
    depositAmount: 0,
    withdrawAmount: 0,
    timelockAmount: 0,
  });
  const [errorMessage, setErrorMessage] = useState("");
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

  async function handleCreateSavings() {
    const amount = ethers.utils.parseEther(`${values.timelockAmount}`);
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
        const transaction = await contract.createSavings({ value: amount });
        await transaction.wait();
        getBankTotalAssets();
        getUserTotalAssets();
        getUserTotalTokens();
        handleChange({ target: { name: "timelockAmount", value: 0 } });
      } catch (err) {
        console.error(err);
      }
    }
  }

  async function handleEmptySavings() {
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
        const transaction = await contract.emptySavings(
          addresses.tokencontract
        );
        const receipt = await transaction.wait();
        const block = await provider.getBlock(receipt.blockNumber);
        const timestamp = new Date(block.timestamp);

        getBankTotalAssets();
        getUserTotalAssets();
        getUserTotalTokens();
        listenForNewMint(provider, timestamp);
      } catch (err) {
        console.error(err);
        const regex = /('.*')/g;
        const messageIndex = err.data.message.search(regex);
        setErrorMessage(err.data.message.slice(messageIndex));
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
    <div id="mainContainer">
      <div id="aumContainer">
        <p id="aumHeading">assets under management:</p>
        <span>
          {bankTotalAssets || 0} MATIC {bankTotalAssets > 10 ? "🤑" : ""}
        </span>
      </div>
      <div id="teller">
        <h2>Quick Deposit and Withdraw</h2>
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

        <div id="userAssets">
          <p>
            <img src={matic} alt="small bird" /> MATIC: {userTotalAssets || 0}
          </p>
          <p>
            <img src={bird} alt="small bird" /> MRDR: {userTotalTokens || 0}
          </p>
        </div>
      </div>

      {newMint ? <div id="eventNewMintMessage">{newMint + "! 🎉"}</div> : ""}

      <div id="vault">
        <h2>Timelocked Vault 🥚</h2>
        <h3>Wanna lock up money for a bit? Yes! 🤞</h3>
        <div id="vaultForm">
          <div id="depositVault">
            <input
              type="number"
              name="timelockAmount"
              value={values.timelockAmount}
              onChange={handleChange}
            />
            {values.timelockAmount > 0 ? (
              <button id="vaultDepositBtn" onClick={handleCreateSavings}>
                Deposit Into Timelocked Vault
              </button>
            ) : (
              <button
                disabled
                id="vaultDepositBtn"
                onClick={handleCreateSavings}
              >
                Deposit Into Timelocked Vault
              </button>
            )}
          </div>

          <div id="withdrawContainer">
            <button id="vaultWithdrawBtn" onClick={handleEmptySavings}>
              Empty your nest
            </button>
            {errorMessage ? (
              <div id="errorMessage">{errorMessage + "⏲️"}</div>
            ) : (
              ""
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Teller;
