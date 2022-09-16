import styles from '../styles/Home.module.css'
import {useRef, useEffect, useState} from "react"
import Web3Modal from 'web3modal'
import {Contract,providers, utils, } from 'ethers'
import Head from 'next/head'
import {NFT_CONTRACT_ADDRESS, abi} from '../constants/index'


export default function Home() {
  const [numTokensMinted,setNumTokensMinted]= useState("0")
  const [loading,setLoading] = useState(false);
  const [presaleEnded,setPresaleEnded] = useState(false)
  const [isOwner,setIsOwner] = useState(false);
  const [presaleStarted,setPresaleStarted] = useState(false);
  const [walletConnected,setWalletConnected] = useState(false);
  // reference to web3Modal
  const web3modalRef = useRef();


  const getNumMintedTokens = async()=>{
    try {
      const provider = await getProviderOrSigner(false);

      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        abi,
        provider
      );
        const numTokeIds = await nftContract.tokenIds();
        setNumTokensMinted(numTokeIds.toString());
    } catch (error) {
      console.error(error)
    }
  }

  const publicMint = async()=>{
    try {
      setLoading(true)
      const signer = await getProviderOrSigner(true);

      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        abi,
        signer
      );

      const txt = await nftContract.mint(
        {value: utils.parseEther("0.01")}
      );
      //waiting transaction to be mined
      await txt.wait();
      window.alert("successful mint");
      

    } catch (error) {
      console.error(error)
    }
    setLoading(false)
  }

  const presaleMint = async()=>{
    try {
      setLoading(true)
      const signer = await getProviderOrSigner(true);

      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        abi,
        signer
      );

      const txt = await nftContract.presaleMint(
        {value: utils.parseEther("0.01")}
      );
      //waiting transaction to be mined
      await txt.wait();
      window.alert("successful mint");


    } catch (error) {
      console.error(error)
    }
    setLoading(false)
  }

  const checkIfPresaleEnded = async()=>{
    try {
      const provider = await getProviderOrSigner();
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        abi,
        provider
      );
      const presaleEndedTime = await nftContract.presaleEnded();
      const currentTIme = Date.now() / 1000;
      const hasPresaleEnded = presaleEndedTime.lt(Math.floor(currentTIme));
      setPresaleEnded(hasPresaleEnded);
    } catch (error) {
      console.error(error)
    }
  }

  const getOwner = async()=>{
    try {
      const signer = await getProviderOrSigner(true);
      const nftContract =  new Contract(
        NFT_CONTRACT_ADDRESS,
        abi,
        signer
      );
      const owner = await nftContract.owner()
      const userAddress = await signer.getAddress();
      if(owner.toLowerCase() === userAddress.toLowerCase()){
        setIsOwner(true);
      }

    } catch (error) {
      console.error(error)
    }
  }

  const startPresale = async()=>{
    try {
      setLoading(true)
      const signer = await getProviderOrSigner(true);
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        abi,
        signer
      );
      const txn = await nftContract.startPresale();
      await txn.wait();
      setPresaleStarted(true);
    } catch (error) {
      console.error(error)
    }
    setLoading(false)
  }

  const checkIfPresaleStarted = async() =>{
    try {
      const provider = await getProviderOrSigner();
      // get instance of nft contract
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        abi,
        provider
      );
      const isPresaleStarted = nftContract.presaleStarted();
     
        setPresaleStarted(isPresaleStarted);
        return isPresaleStarted;
      
    } catch (error) {
      console.error(error)
      return false;
    }
  }

  const connectWallet = async ()=> {
    try {
      await getProviderOrSigner();
    setWalletConnected(true);
    } catch (error) {
      console.error(error)
    }
    
  }

  const getProviderOrSigner = async (needSigner = false)=>{
    // we need to gain access to the provide/signer from metamask
    // update walletconnected to true.

    // opens metamask
    const provider = await web3modalRef.current.connect();
    // gives more methods to web3Provide object
    const web3Provider = new providers.Web3Provider(provider);

    // if not connected to Goerli switch to goerli
    const {chainId} = await web3Provider.getNetwork();
    if(chainId !== 5){
      window.alert("Please swith to Goerli network");
      throw new Error("Incorrect network");
    }
    
    if(needSigner){
      // signer can change thes state of blockchain
      const signer = web3Provider.getSigner();
      return signer;
    }
    // prvider can only read data from blockchain
    return web3Provider;
  }

  const onPageLoad = async()=>{
   await connectWallet()
   await getOwner();
  const presaleStarted = await checkIfPresaleStarted();
  if(presaleStarted){
    await checkIfPresaleEnded();
  }
  // tracks number of nfts minted
  setInterval(async ()=> {
    await getNumMintedTokens();
  }, 5 * 1000);
  
  setInterval(async ()=> {
    const presalaeStarted = await checkIfPresaleStarted();
    if(presalaeStarted){
      await checkIfPresaleEnded();
    }
  }, 5 * 1000);

  }
  useEffect(()=>{
    if(!walletConnected){
      web3modalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        // injectedProvider is metamask
        disableInjectedProvider: false,
      })
      onPageLoad();
    }
  },[])

  function renderBody(){
    
    if(loading){
      return(
        <span className={styles.description}>Loading...</span>
      )
    }

    if(!walletConnected){
     return <button className={styles.button} onClick={connectWallet}>
        Connect your wallet
      </button>
    }
    if(isOwner && !presaleStarted){
      // render a button to start presale
      return <button onCLick={startPresale} className={styles.button} >
        start presale
        </button>

    }
    if(!presaleStarted){
      // presale has not started yet
      return <div>
        <span className={styles.description}>
          presale has not started yet...
        </span>
      </div>
    }
    if(presaleStarted && !presaleEnded){
      // allow whitelisted members to mint
      return <div>
        <span className={styles.description}>
          Presale has started for whitelisted addresses.
        </span>
        <button onClick={presaleMint} className={styles.button}>
          mint now
        </button>
      </div>
    }
    if(presaleEnded){
      // public mint
      <div>
        <span className={styles.description}>
          Presale has ened. Public mint has started.
        </span>
        <button onClick={publicMint} className={styles.button}>
          mint now
        </button>
      </div>
    }

  }

  return <div>
    <Head>
      <title>NFT collection</title>
    </Head>

    <div className={styles.main}>
      <div>
        <h1 className={styles.title}>Welcome</h1>
        <div className={styles.description}>Mint some unique NFT</div>
        <div className={styles.description}>{numTokensMinted}/20</div>
      </div>
      {renderBody()}

    </div>
    
  </div>
}
