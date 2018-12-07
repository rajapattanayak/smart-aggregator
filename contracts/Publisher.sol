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

        address publisherOffer = new PublisherOffer(_publisherOfferHash, msg.sender, address(this), _advertiserOfferContract);

        deployedPublisherOffers.push(publisherOffer);
    }

    function getDeployedPublisherOffers() public view returns (address[]) {
        return deployedPublisherOffers;
    }
}

contract PublisherOffer {
    string public publisherOfferHash;
    address public publisherOwner;
    address public publisherContract;
    address public advertiserOfferContract;

    constructor(string _publisherOfferHash, address _publisherOwner, address _publisherContract, address _advertiserOfferContract) public {
        publisherOfferHash = _publisherOfferHash;
        publisherOwner = _publisherOwner;
        publisherContract = _publisherContract;
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

    struct Click {
        uint256 userId;
        string clickId;
    }
    Click[] clicks;

    struct Conversion {
        string clickId;
        string conversionId;
        string conversionData;
    }
    Converstion[] conversions;

    function registerClick(uint256 _userId, string _clickId) public restricted {
        Click memory newClick = Click({ userId : _userId, clickId: _clickId});
        clicks.push(newClick);
    }

    function getClickByIndex(uint index) public view returns(uint256, string) {
        require(index >= 0, "Index should be a positive value");

        Click storage click = clicks[index];

        return(click.userId, click.clickId);
    }

    function getClicksCount() public view returns(uint) {
        return clicks.length;
    }

    function registerConversion(string _clickId, string _conversionId, string _conversionData) public {
        require(msg.sender == advertiserOfferContract, "You do not have permission to perform this action!");

        Conversion memory newConversion = Conversion({ clickId : _clickId, conversionId : _conversionId, conversionData : _conversionData });
        conversions.push(newConversion);
    }

    function getConversionsCount() public view returns(uint) {
        return conversions.length;
    }

    function getConversionByIndex(uint index) public view returns(string, string, string) {
        require(index >= 0, "Index should be positive");

        Conversion storage conversion = conversions[index];

        return (conversion.clickId, coversion.conversionId, conversion.conversionData);
    }
}