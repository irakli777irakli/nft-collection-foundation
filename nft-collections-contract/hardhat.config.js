require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config()

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY_URL;
const GOERLI_API_KEY = process.env.GOERLI_PRIVATE_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.9",
  networks:{
    goerli:{
      url:ALCHEMY_API_KEY,
      accounts:[GOERLI_API_KEY],
    }
  }
};
