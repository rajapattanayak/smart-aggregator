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

Running migration: 1_initial_migration.js
  Replacing Migrations...
  ... 0x03c8940b3fe9bf3956ea067b995d7e9cf7cb89ff9124d4c416fc598f5067229a
  Migrations: 0xc7aacf4a1ae41a3988ae7acd52bf772a5c94285d
Saving successful migration to network...
  ... 0x43507196c690c0f359c402c2830460bfda0f6c7e56f07655bed416f2e9663eba
Saving artifacts...
Running migration: 2_deploy_contracts.js
  Replacing AdvertiserFactory...
  ... 0xea6b5e2eedad908d7a0466010acebc134ded79fddf4d49cf8ab4359e2dd9b580
  AdvertiserFactory: 0xf7a942c4143d68c35f8ba75ef447eb06c2ff63aa
  Replacing PublisherFactory...
  ... 0xcfd1c0e10c0b95d93de18563c5676a4fd7e6708283b85a415c88561cb5c27f43
  PublisherFactory: 0xbea049b2084b8247383fd8c292a8601cc22fe99f
Saving successful migration to network...
  ... 0x5ac018dcfb58dd25d39aba9a42efb01304750b1485f70466de44ea39576a53de
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

File sizes after gzip:

  416.65 KB  build/static/js/1.500508f5.chunk.js
  112.27 KB  build/static/js/main.af02dad2.chunk.js
  4 KB       build/static/css/main.ae258b2e.chunk.css
  1.61 KB    build/static/css/1.b00b63d5.chunk.css
  763 B      build/static/js/runtime~main.229c360f.js

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

## Flow

### Advertiser creation and Offer creation

```
Go to localhost:3000/advertiser
```

* Advertiser Signup

```
Create a profile for advertiser using MetaMask.
```
![alt text](https://github.com/rajapattanayak/smart-aggregator/blob/master/flow_images/adv_sign_1.png)
![alt text](https://github.com/rajapattanayak/smart-aggregator/blob/master/flow_images/adv_sign_2.png)

* Offer Creation
```
Create an offer with filling up needed information.
```
![alt text](https://github.com/rajapattanayak/smart-aggregator/blob/master/flow_images/adv_off_1.png)
![alt text](https://github.com/rajapattanayak/smart-aggregator/blob/master/flow_images/adv_off_2.png)

### Publisher creation and Offer registration

```
Go to localhost:3000/publisher
```

* Publisher Signup

```
Create a profile for publisher using MetaMask preferably different account 
from advertisers just for simplicity sake.
```
![alt text](https://github.com/rajapattanayak/smart-aggregator/blob/master/flow_images/pub_sign_1.png)
![alt text](https://github.com/rajapattanayak/smart-aggregator/blob/master/flow_images/pub_sign_2.png)

* Offer Registration
```
Register to an existing offer listed out in the all offers sections, 
where there will be a collection of offers from all the advertisers.
```
![alt text](https://github.com/rajapattanayak/smart-aggregator/blob/master/flow_images/pub_off_1.png)
![alt text](https://github.com/rajapattanayak/smart-aggregator/blob/master/flow_images/pub_off_2.png)

### Click Generation
```
Ideally this click generation has to be organised from Publisher Back-end, 
but for time being and easy demo, we are creating it from the publisher page. 
Just fill in the details and submit the form.
```
![alt text](https://github.com/rajapattanayak/smart-aggregator/blob/master/flow_images/click_gen_1.png)
![alt text](https://github.com/rajapattanayak/smart-aggregator/blob/master/flow_images/click_gen_2.png)

### Conversion Generation
```
Ideally this too has to be done from Advertiser Back-end which for the 
time being we skipped. Here you will provide the UI with Publisher Contract Address 
and Click Id which you just generated in the previous step and there you go 
with the conversion.
```
![alt text](https://github.com/rajapattanayak/smart-aggregator/blob/master/flow_images/conv_gen_1.png)
![alt text](https://github.com/rajapattanayak/smart-aggregator/blob/master/flow_images/conv_gen_2.png)