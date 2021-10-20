//Begin
const fs = require('fs');
const path = require("path");
const HDWalletProvider = require('@truffle/hdwallet-provider');

const mnemonic = fs.readFileSync(".secret").toString().trim();
 if (!mnemonic || mnemonic.split(' ').length !== 12) {
  console.log('unable to retrieve mnemonic from .secret');
}


//Update gas price Testnet
/* Run this first, to use the result in truffle-config:
  curl https://public-node.testnet.rsk.co/ -X POST -H "Content-Type: application/json" \
    --data '{"jsonrpc":"2.0","method":"eth_getBlockByNumber","params":["latest",false],"id":1}' \
    > .minimum-gas-price-testnet.json
*/
const gasPriceTestnetRaw = fs.readFileSync(".minimum-gas-price-testnet.json").toString().trim();
const minimumGasPriceTestnet = parseInt(JSON.parse(gasPriceTestnetRaw).result.minimumGasPrice, 16);
if (typeof minimumGasPriceTestnet !== 'number' || isNaN(minimumGasPriceTestnet)) {
  throw new Error('unable to retrieve network gas price from .gas-price-testnet.json');
}
console.log("Minimum gas price Testnet: " + minimumGasPriceTestnet);


module.exports = {
  contracts_build_directory: path.join(__dirname, "app/src/contracts"),

  networks: {
    develop: {
      port: 8545
    }, 
    testnet: { //Testnet RSK with dPathEthereum = metamask addresses
      //https://www.npmjs.com/package/@truffle/hdwallet-provider
      //provider: () => new HDWalletProvider(mnemonic, 'https://public-node.testnet.rsk.co', 0, 10),
      provider: () => new HDWalletProvider({
        mnemonic: { phrase: mnemonic },
        providerOrUrl: 'https://public-node.testnet.rsk.co',
        numberOfAddresses: 10,
        pollingInterval: 15e3 
      }),
      network_id: 31,
      gasPrice: Math.floor(minimumGasPriceTestnet * 1.3),
      networkCheckTimeout: 1e6, //1h = 36e5
      //Source: https://dappsdev.org/blog/2021-02-24-how-to-configure-truffle-to-connect-to-rsk/
      // Higher polling interval to check for blocks less frequently
      // during deployment
      deploymentPollingInterval: 15e3,  //15s = 15e3, default is 4e3
      timeoutBlocks: 100,
    } 
  },

  // Set default mocha options here, use special reporters etc.
  mocha: {  },
  
  // Configure your compilers
  compilers: {
    solc: {
      version: "0.5.7",
    }
  }
}
//End