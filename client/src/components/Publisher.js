import React, { Component } from "react";
import { Link } from "react-router-dom";
import truffleContract from "truffle-contract";

import PublisherContract from "../contracts/Publisher.json";
import PublisherFactoryContract from "../contracts/PublisherFactory.json";
import PublisherOfferContract from "../contracts/PublisherOffer.json";

import AdvertiserContract from "../contracts/Advertiser.json"
import AdvertiserFactoryContract from "../contracts/AdvertiserFactory.json"
import AdvertiserOfferContract from "../contracts/Offer.json"

import getWeb3 from "../utils/getWeb3";
import ipfs from "../utils/ipfs";

import "../index.css";
import "../pure-min.css";

class Publisher extends Component {
  state = {
    message: "",
    web3: null,
    accounts: null,
    publisherFactoryInstance: null,
    isPublisherRegistered: false,
    publisherContractAddress: "",
    publisherName: "",
    publisherWebsite: "",
    publisherProfileHash: ""
  };

  componentDidMount = async () => {
    try {
      const web3 = await getWeb3();
      const accounts = await web3.eth.getAccounts();

      const publisherFactoryContract = truffleContract(PublisherFactoryContract);
      publisherFactoryContract.setProvider(web3.currentProvider);
      const publisherFactoryInstance = await publisherFactoryContract.deployed();

      this.setState({
        web3,
        accounts,
        publisherFactoryInstance
      });

      this.showPublisherHome();
    } catch (err) {
      alert(`Failed to load web3, accounts or contract. Check console for details.`);
      console.log(err);
    }
  };

  pullPublisherProfile = async () => {
    const { publisherInstance, accounts } = this.state;

    try {
      const publisherProfile = await publisherInstance.getProfile({
        from: accounts[0]
      });
      const profileHash = publisherProfile;
      this.setState({ publisherProfileHash: profileHash });

      const ipfsHash = await ipfs.dag.get(this.state.publisherProfileHash);
      const profile = ipfsHash.value;

      if (profile) {
        this.setState({
          publisherName: profile.publisherName,
          publisherWebsite: profile.publisherWebsite
        })
      }

      this.setState({ message: '' });
    } catch (error) {
      console.log(error);
    }
  }

  showPublisherHome = async () => {
    const { accounts, publisherFactoryInstance } = this.state;

    this.setState({ message: 'Pulling Publisher Details.' });

    try {
      const isPublisherRegistered = await publisherFactoryInstance.isPublisherRegistered({
        from: accounts[0]
      });

      if (isPublisherRegistered) {
        this.setState({ isPublisherRegistered });

        const publisherContractAddress = await publisherFactoryInstance.getPublisherByOwner({
          from: accounts[0]
        })
        this.setState({ publisherContractAddress });

        const publisherContract = truffleContract(PublisherContract);
        publisherContract.setProvider(this.state.web3.currentProvider);
        const publisherInstance = await publisherContract.at(publisherContractAddress);

        this.setState({ publisherInstance });

        this.pullPublisherProfile();
      } else {
        this.setState({ message: 'Add Profile' });
      }
    } catch (error) {
      console.log(error);
    }
  };

  registerPublisher = async (event) => {
    console.log('Register Publisher');

    event.preventDefault();

    const { accounts, publisherFactoryInstance } = this.state;

    if (!this.state.publisherName) return;
    if (!this.state.publisherWebsite) return;

    const publisherProfile = {
      publisherName: this.state.publisherName,
      publisherWebsite: this.state.publisherWebsite
    }

    try {
      this.setState({ message: 'Create Advertiser profile' });

      const publisherProfileCid = await ipfs.dag.put(publisherProfile, {
        format: "dag-cbor",
        hashAlg: "sha3-512"
      })
      const publisherProfileCidStr = publisherProfileCid.toBaseEncodedString();
      this.setState({ publisherProfileHash: publisherProfileCidStr });

      await publisherFactoryInstance.registerPublisher(this.state.publisherProfileHash, {
        from: accounts[0]
      })

      this.showPublisherHome();
    } catch (error) {
      console.log(error);
    }
  }

  // pullAllAdvertiserOffer = async () => {
  //   const { advertiserFactoryInstance } = this.state;

  //   try {
  //     const advertisers = await advertiserFactoryInstance.getDeployedAdvertisers();

  //     const advertiserContract = truffleContract(AdvertiserContract);
  //     advertiserContract.setProvider(this.state.web3.currentProvider);

  //     const advertiserOfferContract = truffleContract(AdvertiserOfferContract);
  //     advertiserOfferContract.setProvider(this.state.web3.currentProvider);

  //     const advertiserOfferList = [];
  //     for (const advertiserContractAddress of advertisers) {
  //       const advertiserInstance = await advertiserContract.at(advertiserContractAddress);

  //       // Advertiser Profile
  //       const advertiserProfile = await advertiserInstance.getAdvertiserProfile();
  //       const advertiserProfileHash = advertiserProfile[0] || "";

  //       const ipfsHash = await ipfs.dag.get(advertiserProfileHash);
  //       const profile = ipfsHash.value;
  //       const advertiserName = profile.advertiserName;

  //       // Advertiser Offers
  //       const advertiserOffers = await advertiserInstance.getDeployedOffers();


  //     }

  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }

    if (!this.state.isPublisherRegistered) {
      return (
        <div className="App">
          <div style={{ float: "right" }}>
            <Link onClick={this.forceUpdate} to={"/advertiser"}> ADVERTISER</Link>
          </div>

          <p>{this.state.message}</p>

          <form className="pure-form pure-form-aligned" onSubmit={this.registerPublisher}>
            <h2>Publisher Profile</h2>

            <fieldset>
              <div className="pure-control-group">
                <label htmlFor="pubname">Name</label>
                <input
                  id="pubname"
                  type="text"
                  placeholder="Publisher Name"
                  value={this.state.publisherName}
                  onChange={event => {
                    this.setState({ publisherName: event.target.value });
                  }}
                />
              </div>

              <div className="pure-control-group">
                <label htmlFor="pubwebsite">Website</label>
                <input
                  id="pubwebsite"
                  type="text"
                  placeholder="Publisher Website"
                  value={this.state.publisherWebsite}
                  onChange={event => {
                    this.setState({ publisherWebsite: event.target.value });
                  }}
                />
              </div>

              <div className="pure-control-group">
                <input type="submit" />
              </div>
            </fieldset>
          </form>
          <br />
          <p> You are using {this.state.accounts[0]} account.</p>
        </div>
      )
    }

    return (
      <div className="App">
        <div style={{ float: "right" }}>
          <Link onClick={this.forceUpdate} to={"/advertiser"}> ADVERTISER</Link>
        </div>

        <p>{this.state.message}</p>

        <form className="pure-form pure-form-aligned" onSubmit={this.updateProfile} >
          <h2>Publisher Profile</h2>
          <em> Contract : {this.state.publisherContractAddress}</em>

          <fieldset>
            <div className="pure-control-group">
              <label htmlFor="pubname">Name</label>
              <input
                id="pubname"
                type="text"
                placeholder="Publisher Name"
                value={this.state.publisherName}
                onChange={event => {
                  this.setState({ publisherName: event.target.value });
                }}
              />
            </div>

            <div className="pure-control-group">
              <label htmlFor="pubwebsite">Website</label>
              <input
                id="pubwebsite"
                type="text"
                placeholder="Publisher Website"
                value={this.state.publisherWebsite}
                onChange={event => {
                  this.setState({ publisherWebsite: event.target.value });
                }}
              />
            </div>

            <div className="pure-control-group">
              <input type="submit" />
            </div>
          </fieldset>
        </form>
        <br />
        <p>You are using {this.state.accounts[0]} account</p>
      </div>
    );
  }
}

export default Publisher;