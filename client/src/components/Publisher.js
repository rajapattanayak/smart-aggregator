import React, { Component } from "react";
import { Link } from "react-router-dom";
import truffleContract from "truffle-contract";
import ReactTable from "react-table";

import PublisherContract from "../contracts/Publisher.json";
import PublisherFactoryContract from "../contracts/PublisherFactory.json";
import PublisherOfferContract from "../contracts/PublisherOffer.json";

import AdvertiserContract from "../contracts/Advertiser.json";
import AdvertiserFactoryContract from "../contracts/AdvertiserFactory.json";
import AdvertiserOfferContract from "../contracts/Offer.json";

import getWeb3 from "../utils/getWeb3";
import ipfs from "../utils/ipfs";

import "../index.css";
import "../pure-min.css";

class DisplayConversions extends Component {
  state = {
    conversions: this.props.conversions
  };

  getFormattedTime = unixtime => {
    return new Date(unixtime * 1000).toLocaleString();
  };

  render() {
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
      }
    ];

    return (
      <div style={{ padding: "25px" }}>
        <em style={{ color: "red" }}>Conversions</em>
        <br />
        <br />
        <ReactTable
          data={this.state.conversions}
          columns={columns}
          defaultPageSize={5}
          className="-striped -highlight"
        />
      </div>
    );
  };
}

class DisplayClicks extends Component {
  state = {
    clicks: this.props.clicks
  };
  
  getFormattedTime = unixtime => {
    return new Date(unixtime * 1000).toLocaleString();
  };

  render() {
    const columns = [
      {
        Header: "Click Time",
        id: "clickTime",
        accessor: item => this.getFormattedTime(parseInt(item.clickid, 0))
      },
      {
        Header: "Click Id",
        accessor: "clickid"
      },
      {
        Header: "User Id",
        accessor: "userid",
        Cell: props => <span className="number">{props.value}</span>
      }
    ];
  
    return (
      <div style={{ padding: "25px" }}>
        <em style={{ color: "red" }}>Clicks</em>
        <br />
        <br />
        <ReactTable
          data={this.state.clicks}
          columns={columns}
          defaultPageSize={5}
          className="-striped -highlight"
        />
      </div>
    );
  }
}

class PublisherOfferRegistration extends Component {
  state = {
    advertiserOfferContract: this.props.advertiserOfferContract,
    publisherOfferName: "",
    publisherTargetUrl: ""
  };

  registerToAdvertiserOffer = async event => {
    event.preventDefault();
    this.props.registerToAdvertiserOffer(
      this.state.advertiserOfferContract,
      this.state.publisherOfferName,
      this.state.publisherTargetUrl
    );
  };

  render() {
    return (
      <div style={{ padding: "25px" }}>
        <em style={{ color: "red" }}>Create Publisher Offer</em>
        <br />
        <br />
        <form
          className="pure-form pure-form-aligned"
          onSubmit={this.registerToAdvertiserOffer}
        >
          <fieldset>
            <div className="pure-control-group">
              <label htmlFor="publisheroffername"> Publisher Offer Name </label>
              <input
                id="publisheroffername"
                type="text"
                onChange={event =>
                  this.setState({ publisherOfferName: event.target.value })
                }
              />
            </div>
          </fieldset>

          <fieldset>
            <div className="pure-control-group">
              <label htmlFor="targeturl"> Publisher TargetUrl </label>
              <input
                id="targeturl"
                type="text"
                onChange={event =>
                  this.setState({ publisherTargetUrl: event.target.value })
                }
              />
            </div>
          </fieldset>

          <fieldset>
            <div className="pure-control-group">
              <input type="submit" />
            </div>
          </fieldset>
        </form>
      </div>
    );
  }
}

class Publisher extends Component {
  state = {
    message: "",
    web3: null,
    accounts: null,
    publisherFactoryInstance: null,
    advertiserFactoryinstance: null,
    isPublisherRegistered: false,
    publisherContractAddress: "",
    publisherInstance: null,
    publisherName: "",
    publisherWebsite: "",
    publisherProfileHash: "",
    advertiserOfferList: [],
    publisherOfferList: [],
    publisherOfferContractAddress: "",
    userid: ""
  };

  componentDidMount = async () => {
    try {
      const web3 = await getWeb3();
      const accounts = await web3.eth.getAccounts();

      const publisherFactoryContract = truffleContract(
        PublisherFactoryContract
      );
      publisherFactoryContract.setProvider(web3.currentProvider);
      const publisherFactoryInstance = await publisherFactoryContract.deployed();

      const advertiserFactoryContract = truffleContract(
        AdvertiserFactoryContract
      );
      advertiserFactoryContract.setProvider(web3.currentProvider);
      const advertiserFactoryinstance = await advertiserFactoryContract.deployed();

      this.setState({
        web3,
        accounts,
        publisherFactoryInstance,
        advertiserFactoryinstance
      });

      this.showPublisherHome();
    } catch (err) {
      alert(
        `Failed to load web3, accounts or contract. Check console for details.`
      );
      console.log(err);
    }
  };

  pullClicks = async (publisherOfferInstance) => {
    let clicks = [];
    let sorted_clicks = [];

    const { accounts } = this.state; 

    try {
      this.setState({ message: "Pulling Click Data" });
      const clicksCount = await publisherOfferInstance.getClicksCount.call(
        { from: accounts[0] }
      );

      for (let i = 0; i < clicksCount.toNumber(); i++) {
        const clickInfo = await publisherOfferInstance.getClickByIndex.call(
          i,
          { from: accounts[0] }
        );

        if (clickInfo) {
          const click = {};
          click.userid = clickInfo[0].toNumber();
          click.clickid = clickInfo[1];
          clicks.push(click);
        }
      }
    } catch (err) {
      console.log(err);
    }

    this.setState({ message: "" });

    if (clicks && clicks.length) {
      sorted_clicks = clicks
        .sort((item1, item2) => {
          return (
            new Date(item1.clickid * 1000).getTime() -
            new Date(item2.clickid * 1000).getTime()
          );
        })
        .reverse();
    }
    return sorted_clicks;
  }

  pullConversions = async (publisherOfferInstance) => {
    let conversions = [];
    let sorted_conversions = [];

    const { accounts } = this.state;

    try {
      const conversionCount = await publisherOfferInstance.getConversionsCount({
        from: accounts[0]
      });

      for (let i = 0; i < conversionCount.toNumber(); i++) {
        const conversionInfo = await publisherOfferInstance.getConversionByIndex(i,{
          from: accounts[0]
        });

        if (conversionInfo) {
          const conversion = {};
          conversion.clickId = conversionInfo[0];
          conversion.conversionId = conversionInfo[1];
          conversion.conversionData = conversionInfo[2];
          conversions.push(conversion);
        }
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
    } catch (error) {
      console.log(error);
    }
    return sorted_conversions;
  }

  pullPublisherOffers = async () => {
    const { publisherInstance, accounts, web3 } = this.state;

    try {
      const publisherOffers = await publisherInstance.getDeployedPublisherOffers(
        {
          from: accounts[0]
        }
      );

      const pubOfferContract = truffleContract(PublisherOfferContract);
      pubOfferContract.setProvider(web3.currentProvider);

      const publisherOfferList = [];
      let clicksByPublisherOffer = {};
      let conversionsByPublisherOffer = {};

      for (const publisherOfferContractAddress of publisherOffers) {
        const publisherOfferInstance = await pubOfferContract.at(
          publisherOfferContractAddress
        );
        const publisherOfferProfile = await publisherOfferInstance.getPublisherOffer(
          {
            from: accounts[0]
          }
        );

        const publisherProfileHash = publisherOfferProfile[0] || "";
        const ipfsHash = await ipfs.dag.get(publisherProfileHash);
        const profile = ipfsHash.value;
        const publisherOfferName = profile.publisherOfferName;
        const publisherOfferTargetUrl = profile.publisherTargetUrl;

        const advertiserOfferContractAddress = publisherOfferProfile[3] || "";

        publisherOfferList.push({
          publisherOfferName,
          publisherOfferTargetUrl,
          publisherOfferContractAddress,
          advertiserOfferContractAddress
        });

        const clicks = await this.pullClicks(publisherOfferInstance);
        clicksByPublisherOffer[publisherOfferInstance.address] = clicks;

        const conversions = await this.pullConversions(publisherOfferInstance);
        conversionsByPublisherOffer[publisherOfferInstance.address] = conversions;
      }
      if (publisherOfferList && publisherOfferList.length) {
        this.setState({ publisherOfferList, clicksByPublisherOffer, conversionsByPublisherOffer});
        this.setState({ publisherOfferList });
      }
    } catch (error) {
      console.log(error);
    }
  };

  pullAdvertiserOffers = async () => {
    const { advertiserFactoryinstance, accounts, web3 } = this.state;

    try {
      const advertisers = await advertiserFactoryinstance.getDeployedAdvertisers();

      const advertiserContract = truffleContract(AdvertiserContract);
      advertiserContract.setProvider(web3.currentProvider);

      const advertiserOfferContract = truffleContract(AdvertiserOfferContract);
      advertiserOfferContract.setProvider(web3.currentProvider);

      const advertiserOfferList = [];
      for (const advertiserContractAddress of advertisers) {
        const advertiserInstance = await advertiserContract.at(
          advertiserContractAddress
        );

        const advertiserProfile = await advertiserInstance.getProfile({
          from: accounts[0]
        });
        const advertiserProfileHash = advertiserProfile[0];
        const advprofileipfshash = await ipfs.dag.get(advertiserProfileHash);
        const advertiserprofile = advprofileipfshash.value;
        const advertiserName = advertiserprofile.advertiserName;

        // Advertiser Offers
        const advertiserOffers = await advertiserInstance.getDeployedOffers({
          from: accounts[0]
        });

        for (const advertiserOfferContractAddress of advertiserOffers) {
          const advertiserOfferInstance = await advertiserOfferContract.at(
            advertiserOfferContractAddress
          );

          if (advertiserOfferInstance) {
            const advertiserOfferProfile = await advertiserOfferInstance.getProfile(
              {
                from: this.state.accounts[0]
              }
            );
            const advertiserOfferProfileHash = advertiserOfferProfile[0];

            const advertiserOfferProfileIpfsHash = await ipfs.dag.get(
              advertiserOfferProfileHash
            );
            const advertiserOfferprofile = advertiserOfferProfileIpfsHash.value;
            const advertiserOfferName = advertiserOfferprofile.offerName;
            const advertiserOfferTargetUrl =
              advertiserOfferprofile.offerTargetUrl;

            advertiserOfferList.push({
              advertiserName,
              advertiserContractAddress,
              advertiserOfferName,
              advertiserOfferTargetUrl,
              advertiserOfferContractAddress: advertiserOfferInstance.address
            });
          }
        }
      }
      if (advertiserOfferList && advertiserOfferList.length) {
        this.setState({ advertiserOfferList });
      }
    } catch (error) {
      console.log(error);
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
        });
      }

      this.setState({ message: "" });
    } catch (error) {
      console.log(error);
    }
  };

  showPublisherHome = async () => {
    const { accounts, publisherFactoryInstance } = this.state;

    this.setState({ message: "Pulling Publisher Details." });

    try {
      const isPublisherRegistered = await publisherFactoryInstance.isPublisherRegistered(
        {
          from: accounts[0]
        }
      );

      if (isPublisherRegistered) {
        this.setState({ isPublisherRegistered });

        const publisherContractAddress = await publisherFactoryInstance.getPublisherByOwner(
          {
            from: accounts[0]
          }
        );
        this.setState({ publisherContractAddress });

        const publisherContract = truffleContract(PublisherContract);
        publisherContract.setProvider(this.state.web3.currentProvider);
        const publisherInstance = await publisherContract.at(
          publisherContractAddress
        );

        this.setState({ publisherInstance });

        this.pullPublisherProfile();
        this.pullAdvertiserOffers();
        this.pullPublisherOffers();

        this.setState({ message: "" });
      } else {
        this.setState({ message: "New Publisher. Add Profile" });
      }
    } catch (error) {
      console.log(error);
    }
  };

  registerPublisher = async event => {
    event.preventDefault();

    const { accounts, publisherFactoryInstance } = this.state;

    if (!this.state.publisherName) return;
    if (!this.state.publisherWebsite) return;

    const publisherProfile = {
      publisherName: this.state.publisherName,
      publisherWebsite: this.state.publisherWebsite
    };

    try {
      this.setState({ message: "Create Publisher profile" });

      const publisherProfileCid = await ipfs.dag.put(publisherProfile, {
        format: "dag-cbor",
        hashAlg: "sha3-512"
      });
      const publisherProfileCidStr = publisherProfileCid.toBaseEncodedString();
      this.setState({ publisherProfileHash: publisherProfileCidStr });

      await publisherFactoryInstance.registerPublisher(
        this.state.publisherProfileHash,
        {
          from: accounts[0]
        }
      );

      this.showPublisherHome();
    } catch (error) {
      console.log(error);
    }
  };

  updateProfile = async event => {
    event.preventDefault();

    const { accounts, publisherInstance } = this.state;

    if (!this.state.publisherName) return;
    if (!this.state.publisherWebsite) return;

    const publisherProfile = {
      publisherName: this.state.publisherName,
      publisherWebsite: this.state.publisherWebsite
    };

    try {
      this.setState({ message: "Create Publisher profile" });

      const publisherProfileCid = await ipfs.dag.put(publisherProfile, {
        format: "dag-cbor",
        hashAlg: "sha3-512"
      });
      const publisherProfileCidStr = publisherProfileCid.toBaseEncodedString();
      this.setState({ publisherProfileHash: publisherProfileCidStr });

      await publisherInstance.updateProfile(
        this.state.publisherProfileHash,
        {
          from: accounts[0]
        }
      );

      this.showPublisherHome();
    } catch (error) {
      console.log(error);
    }
  }

  registerToAdvertiserOffer = async (
    advertiserOfferContract,
    publisherOfferName,
    publisherTargetUrl
  ) => {
    const { publisherInstance, accounts } = this.state;

    const publisherOfferData = {
      publisherOfferName: publisherOfferName,
      publisherTargetUrl: publisherTargetUrl
    };

    try {
      const publisherOfferCid = await ipfs.dag.put(publisherOfferData, {
        format: "dag-cbor",
        hashAlg: "sha3-512"
      });
      const publisherofferProfileHash = publisherOfferCid.toBaseEncodedString();

      await publisherInstance.createPublisherOffer(
        publisherofferProfileHash,
        advertiserOfferContract,
        {
          from: accounts[0]
        }
      );

      this.showPublisherHome();
    } catch (error) {
      console.log(error);
    }
  };

  showOfferRegistrationForm = row => {
    const advertiserOfferContract = row.original.advertiserOfferContractAddress;

    return (
      <div>
        <PublisherOfferRegistration
          advertiserOfferContract={advertiserOfferContract}
          registerToAdvertiserOffer={this.registerToAdvertiserOffer}
        />
      </div>
    );
  };

  showAdvertiserOfferList = () => {
    const columns = [
      {
        Header: "Advertiser Name",
        accessor: "advertiserName",
        minWidth: 100
      },
      {
        Header: "Offer Contract",
        accessor: "advertiserOfferContractAddress",
        minWidth: 300
      },
      {
        Header: "Offer Name",
        accessor: "advertiserOfferName",
        minWidth: 100
      },
      {
        Header: "Target URL",
        accessor: "advertiserOfferTargetUrl",
        minWidth: 200
      },
      {
        Header: "Advertiser Contract",
        accessor: "advertiserContractAddress",
        minWidth: 300
      }
    ];

    return (
      <ReactTable
        data={this.state.advertiserOfferList}
        columns={columns}
        defaultPageSize={5}
        className="-striped -highlight"
        SubComponent={this.showOfferRegistrationForm}
      />
    );
  };

  showClicksAndConversions = (row) => {
    const publisherOfferContractAddress = row.original.publisherOfferContractAddress;
    const clicks = this.state.clicksByPublisherOffer[publisherOfferContractAddress];
    const conversions = this.state.conversionsByPublisherOffer[publisherOfferContractAddress];
    return (
      <div>
        <DisplayClicks
          clicks={clicks}
        />
        <DisplayConversions
          conversions={conversions}
        />
      </div>
    )
  }

  showPublisherOfferList = () => {
    const columns = [
      {
        Header: "Offer Name",
        accessor: "publisherOfferName",
        minWidth: 100
      },
      {
        Header: "Target URL",
        accessor: "publisherOfferTargetUrl",
        minWidth: 200
      },
      {
        Header: "Publisher Offer Contract",
        accessor: "publisherOfferContractAddress",
        minWidth: 300
      },
      {
        Header: "Advertiser Offer Contract",
        accessor: "advertiserOfferContractAddress",
        minWidth: 300
      }
    ];

    return (
      <ReactTable
        data={this.state.publisherOfferList}
        columns={columns}
        defaultPageSize={5}
        className="-striped -highlight"
        SubComponent={this.showClicksAndConversions}
      />
    );
  };

  registerClick = async (event) => {
    window.scrollTo(0, 0);
    event.preventDefault();
  
    if (!this.state.publisherOfferContractAddress) return;
    if (!this.state.userid) return;

    const { web3, accounts } = this.state;
    try {
      const pubOfferContract = truffleContract(PublisherOfferContract);
      pubOfferContract.setProvider(web3.currentProvider);
      const publisherOfferInstance = await pubOfferContract.at(
        this.state.publisherOfferContractAddress
      );

      let clickid = parseInt(
        (new Date().getTime() / 1000).toFixed(0),
        0
      ).toString();

      this.setState({ message: "Generate Click" });

      await publisherOfferInstance.registerClick(this.state.userid, clickid, {
        from: accounts[0]
      });

      this.showPublisherHome();
    } catch (err) {
      console.log(err);
    }
  };

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }

    if (!this.state.isPublisherRegistered) {
      return (
        <div className="App">
          <div style={{ float: "right" }}>
            <Link onClick={this.forceUpdate} to={"/advertiser"}>
              {" "}
              ADVERTISER
            </Link>
          </div>

          <p>{this.state.message}</p>

          <form
            className="pure-form pure-form-aligned"
            onSubmit={this.registerPublisher}
          >
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
          <small> You are using {this.state.accounts[0]} account.</small>
        </div>
      );
    }

    return (
      <div className="App">
        <div style={{ float: "right" }}>
          <Link onClick={this.forceUpdate} to={"/advertiser"}>
            {" "}
            ADVERTISER
          </Link>
        </div>

        <p>{this.state.message}</p>

        <form
          className="pure-form pure-form-aligned"
          onSubmit={this.updateProfile}
        >
          <h2>Publisher Profile</h2>
          <em> Contract Address : </em>
          <a
            href={`https://rinkeby.etherscan.io/address/${
              this.state.publisherContractAddress
            }`}
            target="_blank"
          >
            {this.state.publisherContractAddress}
          </a>
          <br />
          <br />

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

        <div>
          <h2>Advertiser Offer List</h2>
          {this.showAdvertiserOfferList()}
        </div>

        <div>
          <h2>Publisher Offer List</h2>
          {this.showPublisherOfferList()}
        </div>

        <br />
        <br />
        <hr />

        <div>
          <h2> Create Click (Test) </h2>
          <form
            className="pure-form pure-form-aligned"
            onSubmit={this.registerClick}
          >
            <fieldset>
              <div className="pure-control-group">
                <label htmlFor="publisheroffercontractaddress">
                  Publisher Offer Contract Address
                </label>
                <input
                  id="publisheroffercontractaddress"
                  type="text"
                  onChange={event =>
                    this.setState({
                      publisherOfferContractAddress: event.target.value
                    })
                  }
                />
              </div>

              <div className="pure-control-group">
                <label htmlFor="userid">User Id</label>
                <input
                  id="userid"
                  type="text"
                  onChange={event =>
                    this.setState({ userid: event.target.value })
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

        <small>You are using {this.state.accounts[0]} account</small>
      </div>
    );
  }
}

export default Publisher;
