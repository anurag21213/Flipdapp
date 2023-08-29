const { wait } = require("@testing-library/user-event/dist/utils");
const { expect } = require("chai")
const { ethers } = require("hardhat")
const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

//GLOBAL VARIABLES
const ID = 1;
const NAME = "Shoes";
const CATEGORY = "Clothing";
const IMAGE = "https://ipfs.io/ipfs/QmQqzMTavQgT4f4T5v6PWBp7XNKtoPmC9jvn12WPT3gkSE";
const COST = tokens(1);
const RATING = 4;
const STOCK = 5

describe("FilpDapp", () => {
  let FilpDapp, flipdapp

  let deployer, buyer
  beforeEach(async () => {
    //getting signers
    [deployer, buyer] = await ethers.getSigners()

    //deploy contract
    FilpDapp = await ethers.getContractFactory("FilpDapp");
    flipdapp = await FilpDapp.deploy()
  })

  describe("Name", () => {
    it("setting owner", async () => {
      expect(await flipdapp.owner()).to.equals(deployer.address)
    })
  })

  describe("Product Listing", () => {
    let transcaction



    beforeEach(async () => {
      transcaction = await flipdapp.connect(deployer).list(
        ID,
        NAME,
        CATEGORY,
        IMAGE,
        COST,
        RATING,
        STOCK

      )

      await transcaction.wait();
    })

    it("Fething list", async () => {

      const item = await flipdapp.items(1);
      expect(item.id).to.equals(ID);
      expect(item.name).to.equals(NAME);
      expect(item.category).to.equals(CATEGORY);
      expect(item.cost).to.equals(COST);
      expect(item.rating).to.equals(RATING);
      expect(item.stock).to.equals(STOCK);

    })

    it("Emit Lists event", async () => {

      expect(transcaction).to.emit(flipdapp, "Lists");

    })
  })

  describe("Product Buying", () => {
    let transcaction



    beforeEach(async () => {
      //list an item
      transcaction = await flipdapp.connect(deployer).list(ID, NAME, CATEGORY, IMAGE, COST, RATING, STOCK)
      await transcaction.wait();

      //BUy an item
      transcaction = await flipdapp.connect(buyer).buy(ID, { value: COST });
      await transcaction.wait()
    })



    it("Update the contract Balance", async () => {
      const result = await ethers.provider.getBalance(flipdapp.address)

      expect(result).to.equals(COST);

    })

    it("Update buyers order count", async () => {
      const result = await flipdapp.orderCount(buyer.address)

      expect(result).to.equals(1);

    })

    it("Add the order", async () => {
      const order = await flipdapp.orders(buyer.address, 1)

      expect(order.time).to.be.greaterThan(0)
      expect(order.item.name).to.equals(NAME);

    })

    it("Emit the Buy event", async () => {


      expect(transcaction).to.emit(flipdapp, "Buy");

    })

  })

  describe("Withdrawing", () => {
    let balanceBefore

    beforeEach(async () => {
      //list a item
      let transcaction = await flipdapp.connect(deployer).list(ID, NAME, CATEGORY, IMAGE, COST, RATING, STOCK)

      await transcaction.wait()

      //buy an item
      transcaction = await flipdapp.connect(buyer).buy(ID, { value: COST })
      await transcaction.wait()

      //get deployer balance before
      balanceBefore = await ethers.provider.getBalance(deployer.address)

      //withdraw
      transcaction = await flipdapp.connect(deployer).withdraw()
      await transcaction.wait()
    })

    it("update the owner balance", async () => {
      const balanceAfter = await ethers.provider.getBalance(deployer.address)
      expect(balanceAfter).to.be.greaterThan(balanceBefore)
    })

    it("update the contract balance", async () => {
      const result = await ethers.provider.getBalance(flipdapp.address)
      expect(result).to.equals(0)
    })
  })
})
