const { expect } = require("chai");
const { ethers } = require("hardhat");


// Setup
const initialSupply = 1000000;
const decimals = 18;

let owner, alice, bob;
let contract = null;

const tokens = function(amount) {
  const exp = ethers.BigNumber.from(10).pow(decimals);
  return ethers.BigNumber.from(amount).mul(exp);
}


beforeEach(async function() {
  [owner, alice, bob] = await ethers.getSigners();

  const ContractFactory = await ethers.getContractFactory("MOK");
  contract = await ContractFactory.deploy(tokens(initialSupply));
  await contract.deployed();
});

afterEach(async function () {
  contract = null;
})

describe("ERC-20 Token: MOK", function() {
  it("Contract Deployment", function() {
    expect(contract.address).to.not.be.undefined;
    expect(contract.address).to.not.be.null;
  });

  describe('totalSupply()', function() {
    it('should have initial supply of ' + initialSupply, async function () {
      const expectedSupply = tokens(initialSupply);
      const actualSupply = await contract.totalSupply();

      expect(actualSupply).to.equal(expectedSupply);
    });
  });

  describe('balanceOf(owner)', function() {
    it('should have correct initial balances', async function () {
      const expectedAmount = tokens(initialSupply);
      const actualAmount = await contract.balanceOf(owner.address);

      expect(actualAmount).to.equal(expectedAmount);
    })
  });
  
  describe('transfer(to, value)', function() {
    it('should return true when called with amount of 0', async function() {
      const transactionReceipt = await contract.connect(owner).transfer(alice.address, 0);
      expect(transactionReceipt).to.not.be.undefined;
      expect(transactionReceipt).to.not.be.null;
    });

    it('should not affect totalSupply', async function() {
      const supplyBeforeTransfer = await contract.totalSupply();
      
      await contract.connect(owner).transfer(alice.address, tokens(100));
      const supplyAfter1stTransfer = await contract.totalSupply();

      await contract.connect(alice).transfer(owner.address, tokens(100));
      const supplyAfter2ndTransfer = await contract.totalSupply();

      expect(supplyBeforeTransfer).to.equal(supplyAfter1stTransfer);
      expect(supplyAfter1stTransfer).to.equal(supplyAfter2ndTransfer);
    });

    it('should update balances accordingly', async function() {
      const ownerBalanceBeforeTransfer = await contract.balanceOf(owner.address);
      const aliceBalanceBeforeTransfer = await contract.balanceOf(alice.address);
      const bobBalanceBeforeTransfer = await contract.balanceOf(bob.address);

      const amountOwnerToAlice = tokens(10000);
      await contract.connect(owner).transfer(alice.address, amountOwnerToAlice);
      const ownerBalanceAfterTransfer = await contract.balanceOf(owner.address);
      const aliceBalanceAfterTransfer = await contract.balanceOf(alice.address);
      
      expect(amountOwnerToAlice).to.equal(ownerBalanceBeforeTransfer.sub(ownerBalanceAfterTransfer));
      expect(amountOwnerToAlice).to.equal(aliceBalanceAfterTransfer.sub(aliceBalanceBeforeTransfer));

      const amountAliceToBob = tokens(500);
      await contract.connect(alice).transfer(bob.address, amountAliceToBob);
      const aliceBalanceAfter2ndTransfer = await contract.balanceOf(alice.address);
      const bobBalanceAfterTransfer = await contract.balanceOf(bob.address);

      expect(amountAliceToBob).to.equal(aliceBalanceAfterTransfer.sub(aliceBalanceAfter2ndTransfer));
      expect(amountAliceToBob).to.equal(bobBalanceAfterTransfer.sub(bobBalanceBeforeTransfer));
    });
  });
});