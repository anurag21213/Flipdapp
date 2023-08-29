import { useEffect, useState } from 'react'
import { ethers } from 'ethers'

// Components
import Navigation from './components/Navigation'
import Section from './components/Section'
import Product from './components/Product'

// ABIs
import Dappazon from './abis/Dappazon.json'

// Config
import config from './config.json'

function App() {
  
  const [account,setaccount]=useState(null)
  const [provider,setProvider]=useState(null)
  const [flipdapp,setFlipdapp]=useState(null)

  const [electronics,setelectronics]=useState(null)
  const [clothing,setclothing]=useState(null)
  const [toys,settoys]=useState(null)

  const [toggle,setToggle]=useState(false)
  const [item,setItem]=useState({})

  const loadBlockchain=async()=>{
    //connect to blockchain
    const provider=new ethers.providers.Web3Provider(window.ethereum)
    setProvider(provider)

     const network=await provider.getNetwork()
     console.log(network)

     //connect to smart contract
     const flipdapp=new ethers.Contract(config[network.chainId].dappazon.address,Dappazon,provider)
     setFlipdapp(flipdapp)

    //load products
    const items=[]

    for(var i=0;i<9;i++){
      const item=await flipdapp.items(i+1)
      items.push(item)
      
    }

    const electronics=items.filter((item)=>item.category==='electronics')
    const clothing=items.filter((item)=>item.category==='clothing')
    const toys=items.filter((item)=>item.category==='toys')

    setelectronics(electronics)
    setclothing(clothing)
    settoys(toys)
  }
  const togglePop=(item)=>{
    setItem(item)

    toggle?setToggle(false):setToggle(true)
  }

  useEffect(()=>{
    loadBlockchain()
  },[])

  return (
    <div>
    <Navigation 
    account={account}
    setAccount={setaccount}
    />

      <h2>Flipdapp Best Sellers</h2>
      {
        electronics&&clothing&&toys&&(
          <div>
          <Section title={"Clothing"} items={clothing} togglePop={togglePop} />
          <Section title={"Electronics"} items={electronics} togglePop={togglePop} />
          <Section title={"Toys"} items={toys} togglePop={togglePop} />
          </div>
        )
      }

      {
        toggle&&(
          <Product item={item} provider={provider} account={account} flipdapp={flipdapp} togglePop={togglePop} />
        )
      }

    </div>
  );
}

export default App;
