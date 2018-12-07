pragma solidity ^0.4.24;

contract AdvertiserFactory {
    address[] deployedAdvertisers;
    mapping(address => address) advertisers; //owner to advertiser
    mapping(address => bool) owners;

    function isAdvertiserRegistered() public view returns(bool) {
        return owners[msg.sender];
    }

    function registerAdvertiser(string _profileHash) public {
        address advertiser = new Advertiser(_profileHash, msg.sender);
        deployedAdvertisers.push(advertiser);
        advertisers[msg.sender] = advertiser; 
        owners[msg.sender] = true;
    }

    function getDeployedAdvertisers() public view returns(address[]) {
        return deployedAdvertisers;
    }

    function getAdvertiserByOwner() public view returns(address) {
        return advertisers[msg.sender];
    }
}

contract Advertiser {
    address owner;
    string profileHash;

    modifier restricted() {
        require(msg.sender==owner, "You need to have advertiser owner credential for this operation");
        _;
    }
    constructor(string _profileHash, address _owner) public {
        owner = _owner;
        profileHash = _profileHash;
    }

    function getProfile() public view returns(string, address) {
        return(
           profileHash,
           owner 
        );
    }
}