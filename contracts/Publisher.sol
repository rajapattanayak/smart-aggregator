pragma solidity ^0.4.24;

contract PublisherFactory {
    address[] public deployedPublishers;
    mapping(address => address) publishers; // owner to publisher
    mapping(address => bool) owners;

    function registerPublisher(string _profileHash) public {
        address publisher = new Publisher(_profileHash, msg.sender);
        deployedPublishers.push(publisher);
        advertisers[msg.sender] = publisher;
        owners[msg.sender] = true;
    }
}

contract Publisher {
    address owner;
    string profileHash;

    constructor(string _profileHash, address _owner) public {
        owner = _owner;
        profileHash = _profileHash;
    }
}