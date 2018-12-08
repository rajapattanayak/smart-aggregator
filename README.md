# Smart Aggregator


## Setup
 
 * Node should be installed

```
node -v
v10.13.0

```

* truffle should be installed

  **npm install -g truffle**

```
truffle -v
Truffle v4.1.14 - a development framework for Ethereum

Usage: truffle <command> [options]

Commands:
  init      Initialize new and empty Ethereum project
  compile   Compile contract source files
  migrate   Run migrations to deploy contracts
  deploy    (alias for migrate)
  build     Execute build pipeline (if configuration present)
  test      Run JavaScript and Solidity tests
  debug     Interactively debug any transaction on the blockchain (experimental)
  opcode    Print the compiled opcodes for a given contract
  console   Run a console with contract abstractions and commands available
  develop   Open a console with a local development blockchain
  create    Helper to create new contracts, migrations and tests
  install   Install a package from the Ethereum Package Registry
  publish   Publish a package to the Ethereum Package Registry
  networks  Show addresses for deployed contracts on each network
  watch     Watch filesystem for changes and rebuild the project automatically
  serve     Serve the build directory on localhost and watch for changes
  exec      Execute a JS module within this Truffle environment
  unbox     Download a Truffle Box, a pre-built Truffle project
  version   Show version number and exit

See more at http://truffleframework.com/docs

```

## Deploy Contracts to Local Blockchain

### Steps:

* Start Ganache Server

* Add/Modify network configuration : truffle.js as per your local and Test setting
    https://truffleframework.com/docs/truffle/reference/configuration#networks

* Change as per ganache running port inside client -> utils -> getWeb3.js (For me line 23 : Port 8545)

* Compile:

  **truffle compile**

```
Compiling ./contracts/Advertiser.sol...
Compiling ./contracts/Publisher.sol...
Writing artifacts to ./client/src/contracts

```

* Migrate Contract to Ganache

  **truffle migrate or truffle migrate --reset**

```
truffle migrate --reset
Using network 'development'.

Using network 'development'.

Running migration: 1_initial_migration.js
  Replacing Migrations...
  ... 0xca999e32abef5941256ed94a993f070ddc67bf3e36d556ff275911401508cebc
  Migrations: 0x993dcef17c7728463c3a305137d6411dc63a8054
Saving successful migration to network...
  ... 0x52d6e1db3aa763eac99a57eaa3d5a1022a5183b758674f76b0204ca0e96a225b
Saving artifacts...
Running migration: 2_deploy_contracts.js
  Replacing AdvertiserFactory...
  ... 0xba7514d9d36c740372f8fe6eb3cdebebb86413de3c8c53e93a7359cfc108defc
  AdvertiserFactory: 0x10bfdebe5e3535e8002d1cbf38a7c101ea46eda1
Saving successful migration to network...
  ... 0xa5ca762d12b1dbf0e0fce35c86e27af05d66ef81b0cad950a2cd5807355b8ffa
Saving artifacts...

```

* Test Using Local Frontend
Go inside "client" folder
    
  **npm run start**


* Create frontend build for production.
Go inside "client" folder
    
  **npm run build**

```
Creating an optimized production build...
Compiled with warnings.

./src/components/Publisher.js
  Line 2:  'Link' is defined but never used  no-unused-vars

Search for the keywords to learn more about each warning.
To ignore, add // eslint-disable-next-line to the line before.

File sizes after gzip:

  309.69 KB (+16.89 KB)  build/static/js/1.f9cebc58.chunk.js
  57.06 KB (+17.24 KB)   build/static/js/main.32dbe04b.chunk.js
  3.86 KB (+3.73 KB)     build/static/css/main.9f6afadb.chunk.css
  1.61 KB                build/static/css/1.695e0daf.chunk.css
  763 B                  build/static/js/runtime~main.229c360f.js

The project was built assuming it is hosted at the server root.
You can control this with the homepage field in your package.json.
For example, add this to build it for GitHub Pages:

  "homepage" : "http://myname.github.io/myapp",

The build folder is ready to be deployed.
You may serve it with a static server:

  yarn global add serve
  serve -s build

Find out more about deployment here:

  http://bit.ly/CRA-deploy

```