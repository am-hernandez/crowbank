const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CrowBank app", () => {
  let bank, token, owner, address_1, address_2;
  let addresses;
  const one = ethers.utils.parseEther("1.0");
  const three = ethers.utils.parseEther("3.0");
  const five = ethers.utils.parseEther("5.0");
  const nine = ethers.utils.parseEther("9.0");

  beforeEach(async () => {
    const BankContract = await ethers.getContractFactory("CrowBank");
    bank = await BankContract.deploy();
    await bank.deployed();

    const TokenContract = await ethers.getContractFactory("Murder");
    token = await TokenContract.deploy(bank.address);
    await token.deployed();

    [owner, address_1, address_2, ...addresses] = await ethers.getSigners();
  });

  describe("on contracts deployment", () => {
    it("bank should have total assets of 0", async () => {
      expect(await bank.totalAssets()).to.equal("0");
    });
    it("owner should have 0 tokens, and 0 deposit", async () => {
      expect(await bank.accounts(owner.address)).to.equal("0");
      expect(await token.balanceOf(owner.address)).to.equal("0");
    });
    it("address_1 should have 0 tokens, and 0 deposit", async () => {
      expect(await bank.accounts(address_1.address)).to.equal("0");
      expect(await token.balanceOf(address_1.address)).to.equal("0");
    });
    it("address_2 should have 0 tokens, and 0 deposit", async () => {
      expect(await bank.accounts(address_2.address)).to.equal("0");
      expect(await token.balanceOf(address_2.address)).to.equal("0");
    });
  });

  describe("bank contract", () => {
    it("allows addresses to deposit MATIC, and totalAssets() returns sum af all deposits", async () => {
      await bank.connect(owner).deposit({ value: one });
      await bank.connect(address_1).deposit({ value: three });
      await bank.connect(address_2).deposit({ value: five });
      expect(await bank.accounts(owner.address)).to.equal(one);
      expect(await bank.accounts(address_1.address)).to.equal(three);
      expect(await bank.accounts(address_2.address)).to.equal(five);

      expect(await bank.totalAssets()).to.equal(nine);
    });

    it("allows addresses to deposit and withdraw MATIC, then receive 1 MRDR token per withdrawal", async () => {
      await bank.connect(owner).deposit({ value: one });
      await bank.connect(address_1).deposit({ value: three });
      await bank.connect(address_2).deposit({ value: five });
      await bank.connect(owner).withdraw(one, token.address);
      await bank.connect(address_1).withdraw(three, token.address);
      await bank.connect(address_2).withdraw(one, token.address);
      await bank.connect(address_2).withdraw(one, token.address);

      expect(await bank.totalAssets()).to.equal(ethers.utils.parseEther("3.0"));

      expect(await token.balanceOf(owner.address)).to.equal(one);
      expect(await token.balanceOf(address_1.address)).to.equal(one);
      expect(await token.balanceOf(address_2.address)).to.equal(
        ethers.utils.parseEther("2.0")
      );
    });

    it("withdraw() should fail when trying to withdraw more MATIC than was deposited by address", async () => {
      await expect(
        bank.connect(address_2).withdraw(one, token.address)
      ).to.be.revertedWith("Cannot withdraw more than deposited.");
    });

    it("deposit() should fail when trying to deposit 0 MATIC", async () => {
      await expect(
        bank
          .connect(address_2)
          .deposit({ value: ethers.utils.parseEther("0.0") })
      ).to.be.revertedWith("Deposit must be more than 0 MATIC");
    });

    describe("timelock", () => {
      it("should create new Timelock savings account on deposit", async () => {
        await bank.connect(owner).createSavings({ value: one });
        const id = await bank.accountToSavings(owner.address);
        const { amount } = await bank.savings(id);

        expect(await bank.accounts(owner.address)).to.equal(one);
        expect(amount).to.equal(one);
      });

      it("should revert on emptySavings() if the timelock has not yet expired", async () => {
        await bank.connect(address_1).createSavings({ value: three });
        await expect(
          bank.connect(address_1).emptySavings(token.address)
        ).to.be.revertedWith("It is still too early to withdraw!");
      });
    });
  });

  describe("token contract", () => {
    describe("mint()", () => {
      it("should fail when called by any address other than the bank", async () => {
        await expect(
          token.connect(bank.signer).mint(owner.address, one)
        ).to.be.revertedWith("Only the bank can mint new Tokens!");
      });
    });

    describe("NewMint()", () => {
      it("event should be emitted after user withdraws from bank and new token is minted", async () => {
        await bank.connect(address_1).deposit({ value: three });

        await expect(bank.connect(address_1).withdraw(three, token.address))
          .to.emit(token, "NewMint")
          .withArgs(one);
      });
    });
  });
});
