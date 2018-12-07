pragma solidity ^0.4.24;

contract AdvertiserFactory {
    address[] public deployedAdvertisers;
    mapping(address => address) advertisers; //owner to advertiser
    mapping(address => bool) owners;

    function registerAdvertiser(string _profileHash) public {
        address advertiser = new Advertiser(_profileHash, msg.sender);
        deployedAdvertisers.push(advertiser);
        advertisers[msg.sender] = advertiser; 
        owners[msg.sender] = true;
    } 
}
contract Advertiser {
    address owner;
    string profileHash;
    constructor(string _profileHash, address _owner) public {
        owner = _owner;
        profileHash = _profileHash;
    }
}