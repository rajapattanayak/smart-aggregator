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
    offersList: [],
    offerContractAddress: "",
    publisherOfferContractAddress:"",
    clickid:"",
    conversionsByOffer: null
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

  pullConversions = async (offerinstance) => {
    const { accounts } = this.state;

    let conversions = [];
    let sorted_conversions =[];

    try {
      const conversionCount = await offerinstance.getConversionsCount({
        from: accounts[0]
      });

      for (let i = 0; i < conversionCount.toNumber(); i++) {
        const conversionInfo = await offerinstance.getConversionByIndex(i, {
          from: accounts[0]
        })

        let conversion = {};
        conversion.clickId = conversionInfo[0];
        conversion.conversionId = conversionInfo[1];
        conversion.conversionData = conversionInfo[2];
        conversion.publisherOfferContractAddress = conversionInfo[3];
        
        conversions.push(conversion);
      }
      if (conversions && conversions.length) {
        sorted_conversions = conversions
          .sort((item1, item2) => {
            return (
              new Date(item1.clickId * 1000).getTime() -
              new Date(item2.clickId * 1000).getTime()
            );
          })
          .reverse();
      }
    } catch(error) {
      console.log(error);
    }
    return sorted_conversions;
  }

  pullOffers = async () => {
    const { advertiserInstance } = this.state;
    let offersList = [];
    let conversionsByOffer = {};

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

            const conversions = await this.pullConversions(offerInstance);
            conversionsByOffer[offerInstance.address] = conversions;
          }
        }
      }
      if (offersList && offersList.length) {
        this.setState({ offersList, conversionsByOffer });
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

  updateProfile = async event => {
    console.log('Update Profile');
    //todo
  }

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

  getFormattedTime = (unixtime) => {
    return new Date(unixtime * 1000).toLocaleString();
  }

  showConversions = row => {
    const offerContractAddress = row.original.offerContractAddress;
    const conversions = this.state.conversionsByOffer[offerContractAddress];
    const columns = [
      {
        Header: "CLICK",
        columns: [
          {
            Header: "Time",
            id: "clickTime",
            accessor: item => this.getFormattedTime(parseInt(item.clickId, 0)),
            minWidth: 200
          },
          {
            Header: "Id",
            accessor: "clickId",
            minWidth: 150
          }
        ]
      },
      {
        Header: "CONVERSION",
        columns: [
          {
            Header: "Id",
            accessor: "conversionId",
            minWidth: 150
          },
          {
            Header: "Conversion Data",
            accessor: "conversionData"
          }
        ]
      },
      {
        Header: "PUBLISHER OFFER",
        columns: [
          {
            Header: "Contrcat Address",
            accessor: "publisherOfferContractAddress",
            minWidth: 400
          }
        ]
      }
    ];

    return (
      <div style={{ padding: "25px" }}>
        <em style={{ color: "red" }}>Click And Conversion</em>
        <br />
        <br />
        <ReactTable
          data={conversions}
          columns={columns}
          defaultPageSize={3}
          showPagination={false}
        />
      </div>
    );
  }
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
        SubComponent={this.showConversions}
      />
    );
  };

  registerConversion = async (event) => {
    window.scrollTo(0,0);
    event.preventDefault();
    
    const { accounts, web3 } = this.state;

    if (!this.state.offerContractAddress) return;
    if (!this.state.publisherOfferContractAddress) return;
    if (!this.state.clickid) return;

    try {
      this.setState({message: "Creating Test Converstion"});
      
      const offerContract = truffleContract(
        OfferContract
      );

      offerContract.setProvider(web3.currentProvider);
      const offerInstance = await offerContract.at(
        this.state.offerContractAddress
      );

      let conversionid = parseInt(
        (new Date().getTime() / 1000).toFixed(0),
        0
      ).toString();
      const conversionData = "100$-Sale-1$-Cashback";

      await offerInstance.registerConversion(
        this.state.publisherOfferContractAddress,
        this.state.clickid,
        conversionid,
        conversionData,
        {
          from : accounts[0]
        }
      );

      this.showAdvertiserHome();
    } catch(error) {
      console.log(error)
    }
  }

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

        <div>
          <h2> Create Conversion (Test) </h2>
          <form
            className="pure-form pure-form-aligned"
            onSubmit={this.registerConversion}
          >
            <fieldset>
              <div className="pure-control-group">
                <label htmlFor="offercontractaddr">
                  Offer Contract Address
                </label>
                <input
                  id="offercontractaddr"
                  type="text"
                  value={this.state.offerContractAddress}
                  onChange={event =>
                    this.setState({ offerContractAddress: event.target.value })
                  }
                />
              </div>

              <div className="pure-control-group">
                <label htmlFor="publisheroffercontractaddr">
                  Publisher Offer Contract Address
                </label>
                <input
                  id="publisheroffercontractaddr"
                  type="text"
                  value={this.state.publisherOfferContractAddress}
                  onChange={event =>
                    this.setState({ publisherOfferContractAddress: event.target.value })
                  }
                />
              </div>

              <div className="pure-control-group">
                <label htmlFor="clickid">Click Id</label>
                <input
                  id="clickid"
                  type="text"
                  placeholder="Click Id"
                  value={this.state.clickid}
                  onChange={event =>
                    this.setState({ clickid: event.target.value })
                  }
                />
              </div>

              <div className="pure-control-group">
                <input type="submit" />
              </div>
            </fieldset>
          </form>
        </div>

        <br />
        <br />
        
        <p>You are using {this.state.accounts[0]} account</p>
      </div>
    );
  }
}

export default Advertiser;
