require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.19",
  networks: {
    ganache: {
      url: process.env.GANACHE_URL || "http://127.0.0.1:7545",
      accounts: process.env.GANACHE_PRIVATE_KEY ? [process.env.GANACHE_PRIVATE_KEY] : []
    }
  }
};
