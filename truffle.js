const path = require("path");
var HDWalletProvider = require("truffle-hdwallet-provider");
require('dotenv').config();

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*"
    },
    rinkeby: {
      provider: function() {
        return new HDWalletProvider(process.env.MNEMONIC,
          "https://rinkeby.infura.io/" + process.env.INFURA_APIKEY
        );
      },
      network_id: 4
    }
  }
};
