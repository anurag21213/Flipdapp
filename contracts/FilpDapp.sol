// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract FilpDapp {
  
  address public owner;

  struct Item {
    uint256 id;
    string name;
    string category;
    string image;
    uint256 cost;
    uint256 rating;
    uint256 stock;
  }

  struct Order{
    uint256 time;
    Item item;
  }

  mapping (uint256 =>Item)public items;
  mapping (address => uint256) public orderCount;
  mapping (address => mapping (uint256 =>Order )) public orders;

  event Lists(string name,uint256 cost,uint256 quantity);
  event Buy(address buyer,uint256 orderId,uint256 itemId);

  modifier onlyOwner() {
    require(msg.sender==owner,"You are not owner");
    _;
  }

  constructor(){
    
    owner=msg.sender;

  }


  //listing of products
  function list(
    uint256 _id,
    string memory _name,
    string memory _category,
    string memory _image,
    uint256 _cost,
    uint256 _rating,
    uint256 _stock
  ) public onlyOwner{

    

    //creating new item

    Item memory item=Item(_id,_name,_category,_image,_cost,_rating,_stock);

    //saving into blockchain
    items[_id]=item;

    //emit events whwn nwe product is listed
    emit Lists(_name,_cost,_stock);

  }

  //buy

  function buy(uint256 _id) public payable{
    //fetch item from blockchain
    Item memory item=items[_id];
    
    //check for enough ethers
    require(msg.value>=item.cost);

    //require item to be in stocks
    require(item.stock>0);

    //create an order
    Order memory order=Order(block.timestamp,item);

    //add orders for user
    orderCount[msg.sender]++;
    orders[msg.sender][orderCount[msg.sender]]=order;

    //Subtract stock
    items[_id].stock=item.stock-1;
    //emit event

    emit Buy(msg.sender,orderCount[msg.sender],item.id);
  }


  //withdraw funds

  function withdraw() public onlyOwner{
    (bool success,)=owner.call{value:address(this).balance}("");
    require(success);
  }
  
}
