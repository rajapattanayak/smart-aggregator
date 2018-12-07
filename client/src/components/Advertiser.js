import React, { Component } from "react";
import AdvertiserFactoryContract from "../contracts/AdvertiserFactory.json";
import getWeb3 from "../utils/getWeb3";
import truffleContract from "truffle-contract";

import "../App.css";


class Advertiser extends Component {
  state = { 
    message: "", 
    web3: null, 
    accounts: null, 
    advertiserFactoryInstance: null
  };

  componentDidMount = async () => {
    try {
      const web3 = await getWeb3();
      const accounts = await web3.eth.getAccounts();

      const advertiserFactoryContract = truffleContract(AdvertiserFactoryContract);
      advertiserFactoryContract.setProvider(web3.currentProvider);
      const advertiserFactoryInstance = await advertiserFactoryContract.deployed();

      this.setState({ 
        web3,
        accounts,
        advertiserFactoryInstance
      });

      this.showAdvertiserHome();
    } catch (error) {
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.log(error);
    }
  };

  showAdvertiserHome = async () => {
    const { accounts, advertiserFactoryInstance } = this.state;

    this.setState({message: 'Pulling Advertiser profile'});

    try {
      const isAdvertiserRegistered = await advertiserFactoryInstance.isAdvertiserRegistered({
        from: accounts[0]
      });
  
      if (isAdvertiserRegistered) {
        // Pull Profile
        console.log('Exists !');

      } else {
        console.log('New Advertiser !');
        this.setState({message: 'Add Profile'});
      }
    } catch(error) {
      console.log(error);
    }
  };

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        
      </div>
    );
  }
}

export default Advertiser;