var Advertiserfactory = artifacts.require("Advertiserfactory");
var Publisherfactory = artifacts.require("Publisherfactory");

module.exports = function(deployer) {
  deployer.deploy(Advertiserfactory).then(() => {
    return deployer.deploy(Publisherfactory)
  });
};
