pragma solidity ^0.4.24;

contract PublisherFactory {
    address[] public deployedPublishers;
    mapping(address => address) publishers; // owner to publisher
    mapping(address => bool) owners;

    function isPublisherRegistered() public view returns(bool) {
        return owners[msg.sender];
    }

    function registerPublisher(string _profileHash) public {
        address publisher = new Publisher(_profileHash, msg.sender);
        deployedPublishers.push(publisher);
        publishers[msg.sender] = publisher;
        owners[msg.sender] = true;
    }

    function getPublisherByOwner() public view returns(address) {
        return publishers[msg.sender];
    }

    function getDeployedPublishers() public view returns(address[]) {
        return deployedPublishers;
    }
}

contract Publisher {
    address owner;
    string profileHash;

    address[] deployedPublisherOffers;

    constructor(string _profileHash, address _owner) public {
        owner = _owner;
        profileHash = _profileHash;
    }

    modifier restricted() {
        require(msg.sender == owner, "You are not authorized to perform this action!");
        _;
    }

    function updateProfile(string _profileHash) public restricted {
        profileHash = _profileHash;
    }

    function getProfile() public view returns(string) {
        return profileHash;
    }

    function createPublisherOffer(string _publisherOfferHash, address _advertiserOfferContract) public restricted {
        require(_advertiserOfferContract != address(0), "Advertiser Offer Contract address is not found!");

        address publisherOffer = new PublisherOffer(_publisherOfferHash, address(this), msg.sender, _advertiserOfferContract);

        deployedPublisherOffers.push(publisherOffer);
    }

    function getDeployedPublisherOffers() public view returns (address[]) {
        return deployedPublisherOffers;
    }
}

contract PublisherOffer {
    string public publisherOfferHash;
    address public advertiserOfferContract;
    address public publisherOwner;
    address public publisherContract;

    constructor(string _publisherOfferHash, address _publisherContract, address _publisherOwner, address _advertiserOfferContract) public {
        publisherOfferHash = _publisherOfferHash;
        publisherContract = _publisherContract;
        publisherOwner = _publisherOwner;
        advertiserOfferContract = _advertiserOfferContract;
    }

    modifier restricted() {
        require(msg.sender == publisherOwner, "You are not autorized to perform this actions");
        _;
    }

    function updatePublisherOffer(string _publisherOfferHash) public restricted {
        publisherOfferHash = _publisherOfferHash;
    }

    function getPublisherOffer() public view returns(string, address, address, address) {
        return(publisherOfferHash, publisherContract, publisherOwner, advertiserOfferContract);
    }
}