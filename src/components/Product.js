import { useEffect, useState } from 'react'
import { ethers } from 'ethers'

// Components
import Rating from './Rating'

import close from '../assets/close.svg'

const Product = ({ item, provider, account, flipdapp, togglePop }) => {

  const [order,setOrder]=useState(null)
  const [hasBought,sethasBought]=useState(false)

  const fetchDeatils=async()=>{
    const events=await flipdapp.queryFilter("Buy")
    const orders=events.filter(
      (event)=>event.args.buyer===account&&event.args.itemId.toString()===item.id.toString()
    )

    if(orders.longht===0)return

    const order=await flipdapp.orders(account,orders[0].args.orderId)
    setOrder(order)
  }


  const buyHandler=async()=>{
    const signer=await provider.getSigner() 
    console.log(flipdapp)
    let transeaction=await flipdapp.connect(signer).buy(item.id,{value:item.cost});
    await transeaction.wait()

    sethasBought(true)

  }
  useEffect(()=>{
    fetchDeatils()
  },[hasBought])

  return (
    <div className="product">
      <div className='product__details'>
        <div className='product__image'>
          <img src={item.image} alt='product' />
        </div>
        <div className='product__overview'>
            <h1>{item.name}</h1>

            <Rating value={item.rating} />

            <hr></hr>
            <p>{item.address}</p>
            <h2>{ethers.utils.formatUnits(item.cost.toString(),'ether')} ETH</h2>

            <hr />

           
        </div>

        <div className='product__order'>
        <h1>{ethers.utils.formatUnits(item.cost.toString(),'ether')} ETH</h1>
        <p>
        FREE DELIVERY<br/>

        <strong>
        {
          new Date(Date.now()+345600000).toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'})
        }
        </strong>
        
        </p>

        {
          item.stock>0?(
            <p>In Stock</p>
          ):
          (<p>Out of Stock</p>)
        }

        <button className='product__buy' onClick={buyHandler}>
        Buy Now
        </button>
        <p><small>Ships from Flipdapp</small></p>
        <p><small>Sold by</small> Flipdapp</p>

        {
          order&&(
            <div className='product__bought'>
            Item bought on<br/>

            <strong>
            {
              new Date(Number(order.time.toString()+'000')).toLocaleDateString(
                undefined,
                {
                  weekday:'long',
                  hour:'numeric',
                  minute:'numeric',
                  second:'numeric'
                }
              )
            }
            
            </strong>
            
            
            </div>
          )
        }




        </div>

        <button onClick={togglePop} className='product__close'>
        <img src={close} alt='Close' />
        </button>

      </div>

    </div>
  );
}

export default Product;