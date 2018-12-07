import React, { Component } from "react";
import { Link } from "react-router-dom";
import truffleContract from "truffle-contract";
import ReactTable from 'react-table';

import AdvertiserFactoryContract from "../contracts/AdvertiserFactory.json";
import AdvertiserContract from "../contracts/Advertiser.json";
import OfferContract from "../contracts/Offer.json";

import getWeb3 from "../utils/getWeb3";
import ipfs from "../utils/ipfs";

import "../index.css";
import "../pure-min.css";
import "react-table/react-table.css";

class Advertiser extends Component {
  state = {
    message: "",
    web3: null,
    accounts: null,
    advertiserFactoryInstance: null,
    isAdvertiserRegistered: false,
    advertiserContractAddress: "",
    advertiserName: "",
    advertiserWebsite: "",
    advertiserProfileHash: "",
    offerName: "",
    offerTargetUrl: "",
    offerProfileHash: "",
    offersList: []
  };

  componentDidMount = async () => {
    try {
      const web3 = await getWeb3();
      const accounts = await web3.eth.getAccounts();

      const advertiserFactoryContract = truffleContract(
        AdvertiserFactoryContract
      );
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

  pullOffers = async () => {
    console.log("Pulling Offers");
    const { advertiserInstance } = this.state;
    let offersList = [];

    try {
      const offers = await advertiserInstance.getDeployedOffers({
        from: this.state.accounts[0]
      });

      const offerContract = truffleContract(OfferContract);
      offerContract.setProvider(this.state.web3.currentProvider);

      for (const offer of offers) {
        const offerInstance = await offerContract.at(offer);

        if (offerInstance) {
          const offerProfile = await offerInstance.getProfile({
            from: this.state.accounts[0]
          });
          const profileHash = offerProfile[0];

          const ipfshash = await ipfs.dag.get(profileHash);
          const profile = ipfshash.value;

          if (profile) {
            const offerName = profile.offerName;
            const offerTargetUrl = profile.offerTargetUrl;

            offersList.push({
              offerName,
              offerTargetUrl,
              offerContractAddress: offerInstance.address
            });
          }
        }
      }
      if (offersList && offersList.length) {
        this.setState({ offersList });
      }
    } catch (error) {
      console.log(error);
    }
  };

  pullAdvertiserProfile = async () => {
    const { accounts, advertiserInstance } = this.state;

    try {
      const advertiserProfile = await advertiserInstance.getProfile({
        from: accounts[0]
      });
      const profilehash = advertiserProfile[0];
      this.setState({ advertiserProfileHash: profilehash });

      const ipfshash = await ipfs.dag.get(this.state.advertiserProfileHash);
      const profile = ipfshash.value;

      if (profile) {
        this.setState({
          advertiserName: profile.advertiserName,
          advertiserWebsite: profile.advertiserWebsite
        });
      }

      this.setState({ message: "" });
    } catch (error) {
      console.log(error);
    }
  };

  showAdvertiserHome = async () => {
    const { accounts, advertiserFactoryInstance } = this.state;

    this.setState({ message: "Pulling Advertiser Details" });

    try {
      const isAdvertiserRegistered = await advertiserFactoryInstance.isAdvertiserRegistered(
        {
          from: accounts[0]
        }
      );

      if (isAdvertiserRegistered) {
        this.setState({ isAdvertiserRegistered });

        const advertiserContractAddress = await advertiserFactoryInstance.getAdvertiserByOwner(
          {
            from: accounts[0]
          }
        );
        this.setState({ advertiserContractAddress });

        const advertiserContract = truffleContract(AdvertiserContract);
        advertiserContract.setProvider(this.state.web3.currentProvider);
        const advertiserInstance = await advertiserContract.at(
          advertiserContractAddress
        );

        this.setState({ advertiserInstance });

        this.pullAdvertiserProfile();
        this.pullOffers();
      } else {
        this.setState({ message: "Add Profile" });
      }
    } catch (error) {
      console.log(error);
    }
  };

  registerAdvertiser = async event => {
    console.log("Register Advertiser");

    event.preventDefault();

    const { accounts, advertiserFactoryInstance } = this.state;

    if (!this.state.advertiserName) return;
    if (!this.state.advertiserWebsite) return;

    const advertiserprofile = {
      advertiserName: this.state.advertiserName,
      advertiserWebsite: this.state.advertiserWebsite
    };

    try {
      this.setState({ message: "Create Advertiser profile" });

      const advertiserProfileCid = await ipfs.dag.put(advertiserprofile, {
        format: "dag-cbor",
        hashAlg: "sha3-512"
      });
      const advertiserProfileCidStr = advertiserProfileCid.toBaseEncodedString();
      this.setState({ advertiserProfileHash: advertiserProfileCidStr });

      await advertiserFactoryInstance.registerAdvertiser(
        this.state.advertiserProfileHash,
        {
          from: accounts[0]
        }
      );

      this.showAdvertiserHome();
    } catch (error) {
      console.log(error);
    }
  };

  createOffer = async event => {
    event.preventDefault();

    const { accounts, advertiserInstance } = this.state;

    if (!this.state.advertiserName) return;
    if (!this.state.advertiserWebsite) return;

    const offerProfile = {
      offerName: this.state.offerName,
      offerTargetUrl: this.state.offerTargetUrl
    };

    try {
      this.setState({ message: "Create Offer" });

      const offerProfileCid = await ipfs.dag.put(offerProfile, {
        format: "dag-cbor",
        hashAlg: "sha3-512"
      });
      const offerProfileCidStr = offerProfileCid.toBaseEncodedString();
      this.setState({ offerProfileHash: offerProfileCidStr });

      await advertiserInstance.createOffer(this.state.offerProfileHash, {
        from: accounts[0]
      });

      this.showAdvertiserHome();
    } catch (error) {
      console.log(error);
    }
  };

  showOfferList = () => {
    const columns = [
      {
        Header: "Name",
        accessor: "offerName",
        minWidth: 100
      },
      {
        Header: "Traget URL",
        accessor: "offerTargetUrl",
        minWidth: 300
      },
      {
        Header: "Offer Contract Address",
        accessor: "offerContractAddress",
        minWidth: 400
      }
    ];

    return (
      <ReactTable
        data={this.state.offersList}
        columns={columns}
        defaultPageSize={5}
        className="-striped -highlight"
      />
    );
  };

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }

    if (!this.state.isAdvertiserRegistered) {
      return (
        <div className="App">
          <div style={{ float: "right" }}>
            <Link onClick={this.forceUpdate} to={"/publisher"}>
              PUBLISHER
            </Link>
          </div>

          <p>{this.state.message}</p>

          <form
            className="pure-form pure-form-aligned"
            onSubmit={this.registerAdvertiser}
          >
            <h2>Advertiser Profile</h2>

            <fieldset>
              <div className="pure-control-group">
                <label htmlFor="advname">Name</label>
                <input
                  id="advname"
                  type="text"
                  placeholder="Amazon"
                  value={this.state.advertiserName}
                  onChange={event => {
                    this.setState({ advertiserName: event.target.value });
                  }}
                />
              </div>

              <div className="pure-control-group">
                <label htmlFor="advwebsite">Website</label>
                <input
                  id="advwebsite"
                  type="text"
                  placeholder="amazon.com"
                  value={this.state.advertiserWebsite}
                  onChange={event => {
                    this.setState({ advertiserWebsite: event.target.value });
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

    return (
      <div className="App">
        <div style={{ float: "right" }}>
          <Link onClick={this.forceUpdate} to={"/publisher"}>
            PUBLISHER
          </Link>
        </div>

        <p>{this.state.message}</p>

        <form
          className="pure-form pure-form-aligned"
          onSubmit={this.updateProfile}
        >
          <h2>Advertiser Profile</h2>
          <em> Contract Address : </em>
          <a
            href={`https://rinkeby.etherscan.io/address/${
              this.state.advertiserContractAddress
            }`}
            target="_blank"
          >
            {this.state.advertiserContractAddress}
          </a>
          <br />
          <br />

          <fieldset>
            <div className="pure-control-group">
              <label htmlFor="advname">Name</label>
              <input
                id="advname"
                type="text"
                placeholder="Amazon"
                value={this.state.advertiserName}
                onChange={event => {
                  this.setState({ advertiserName: event.target.value });
                }}
              />
            </div>

            <div className="pure-control-group">
              <label htmlFor="advwebsite">Website</label>
              <input
                id="advwebsite"
                type="text"
                placeholder="amazon.com"
                value={this.state.advertiserWebsite}
                onChange={event => {
                  this.setState({ advertiserWebsite: event.target.value });
                }}
              />
            </div>

            <div className="pure-control-group">
              <input type="submit" />
            </div>
          </fieldset>
        </form>
        <br />

        <form
          className="pure-form pure-form-aligned"
          onSubmit={this.createOffer}
        >
          <h2>New Offer</h2>

          <fieldset>
            <div className="pure-control-group">
              <label htmlFor="offerName">Name</label>
              <input
                id="offerName"
                type="text"
                placeholder="Amazon HP Laptop Discount"
                value={this.state.offerName}
                onChange={event => {
                  this.setState({ offerName: event.target.value });
                }}
              />
            </div>
            <div className="pure-control-group">
              <label htmlFor="offerTargetUrl">TargetUrl</label>
              <input
                id="offerTargetUrl"
                type="text"
                placeholder="amazon.com/laptopdeal"
                value={this.state.offerTargetUrl}
                onChange={event => {
                  this.setState({ offerTargetUrl: event.target.value });
                }}
              />
            </div>
            <div className="pure-control-group">
              <input type="submit" />
            </div>
          </fieldset>
        </form>

        <br />
        <div>
          <h2>Offer List</h2>
          {this.showOfferList()}
        </div>

        <br />
        <br />
        <hr />
        
        <p>You are using {this.state.accounts[0]} account</p>
      </div>
    );
  }
}

export default Advertiser;
