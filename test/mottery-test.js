const { expect } = require("chai");
const { ethers } = require("hardhat");
const { isCallTrace } = require("hardhat/internal/hardhat-network/stack-traces/message-trace");

// SETUP:
const initialSupply = 1000000;
const decimals = 18;

let owner, alice, bob;
let token, lottery;

const tokens = function(amount) {
  const exp = ethers.BigNumber.from(10).pow(decimals);
  return ethers.BigNumber.from(amount).mul(exp);
}

beforeEach(async function() {
  [owner, alice, bob] = await ethers.getSigners();

  const TokenFactory = await ethers.getContractFactory("MOK");
  token = await TokenFactory.deploy(tokens(initialSupply));
  await token.deployed();

  const LotteryFactory = await ethers.getContractFactory("Mottery");
  lottery = await LotteryFactory.deploy(token.address);
  await lottery.deployed();
});

afterEach(async function() {
  token = null;
  lottery = null;
});

// TEST(s):
describe("Mottery: A Simple Lottery", function() {
  it("Contract Deployment", function() {
    expect(token.address).to.not.be.undefined;
    expect(token.address).to.not.be.null;
    expect(lottery.address).to.not.be.undefined;
    expect(lottery.address).to.not.be.null;
  });

  
});