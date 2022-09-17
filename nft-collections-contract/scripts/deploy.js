const {ethers} = require("hardhat")
require("dotenv").config({ path: ".env" });
const { WHITELIST_CONTRACT_ADDRESS, METADATA_URL } = require("../constants/index");

async function main() {
  
  const whitelistContract = WHITELIST_CONTRACT_ADDRESS;
  const metadataURL = METADATA_URL;

  // deploy
  const cryptoDevsContract = await ethers.getContractFactory("CryptoDevs");
  const deployedCryptoDevsContract = cryptoDevsContract.deploy(
    metadataURL,
    whitelistContract
  )

  console.log(
    "Crypto Devs Contract Address:",
    deployedCryptoDevsContract.address()
  );

  
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

// vercel metadat is missing


