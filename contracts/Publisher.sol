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
        advertisers[msg.sender] = publisher;
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
}