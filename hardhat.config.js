require("@nomiclabs/hardhat-waffle");
const secret = require('./.env/secrets.json');

module.exports = {
  solidity: "0.8.4",
  paths: {
    artifacts: './src/artifacts',
    tests: './test',
  },
  networks: {
    hardhat: {
      chainId: 1337
    },
    mumbai: {
      url: secret.mumbaiNode,
      accounts: [secret.privatekey],
    },
  }
};
