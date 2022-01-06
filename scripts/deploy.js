const fs = require('fs');

async function main() {
  const BankContract = await ethers.getContractFactory('CrowBank');
  const bank = await BankContract.deploy();
  await bank.deployed();
  console.log(`The CrowBank Contract was deployed to: ${bank.address}`);

  const TokenContract = await ethers.getContractFactory('Murder');
  const token = await TokenContract.deploy(bank.address);
  await token.deployed();
  console.log(`The Murder Contract was deployed to: ${token.address}`);

  // create the env file with smart contract addresses
  let addresses = { bankcontract: bank.address, tokencontract: token.address };
  let addressesJSON = JSON.stringify(addresses);
  fs.writeFileSync('src/blockchain/contract-address.json', addressesJSON);
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });