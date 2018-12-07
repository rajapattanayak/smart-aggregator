import React, { Component } from "react";
import { Link } from "react-router-dom";

import AdvertiserContract from "../contracts/Advertiser.json";
import AdvertiserFactoryContract from "../contracts/AdvertiserFactory.json";
import AdvertiserOfferContract from "../contracts/Offer.json";

import PublisherContract from "../contracts/Publisher.json";
import PublisherFactoryContract from "../contracts/PublisherFactory.json";
import PublisherOfferContract from "../contracts/PublisherOffer.json";

import getWeb3 from "../utils/getWeb3";

import truffleContract from "truffle-contract";
// import ReactTable from "react-table";

import "../index.css";
// missing pure-min.css file;
// import "react-table/react-table.css";

class Publisher extends Component {
    state = {
        message: "",
        web3: null,
        accounts: null,
        factoryInstance: null,
        isPublisherRegistered: false,
        publisherContractAddress: "",
        publisherName: "",
        publisherWebsite: "",
        publisherInstance: null
    };

    componentDidMount = async () => {
        try {
            const web3 = await getWeb3();
            
            const accounts = await web3.eth.getAccounts();
            const factoryContract = truffleContract(PublisherFactoryContract);
            factoryContract.setProvider(web3.currentProvider);
            const factoryInstance = await factoryContract.deployed();

            this.setState({
                web3,
                accounts,
                factoryInstance
            });

            this.showPublisherHome();
        } catch (err) {
            console.log(err);
        }
    };

    pullPublisherProfile = async () => {
        console.log("Pull Publisher Profile");

        const { publisherInstance, accounts } = this.state;
    };

    render() {
        return <div> Publisher Home</div>;
    }
}

export default Publisher;