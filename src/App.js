import { ethers } from "ethers";
import React, {useState, useEffect} from "react";
import abi from './utils/waveportal.json'
import './App.css';

export default function App() {
  const [currentAccount, setCurrentAccount] = useState("");
  const [totalWaves, setTotalWaves] = useState("Couldn't retrieve");
  const [mining, setMining] = useState(false);
  const [allWaves, setAllWaves] = useState([]);
  const [message, setMessage] = useState("");
  const [enterMessage, setEnterMessage] = useState(false);
  const [messageAlert, setMessageAlert] = useState(false);

  const contractAddress  = "0x84d2C825cB8BE8a9dd4FECb36B0CE4b817906633";
  const contractABI = abi.abi;

  const checkIFWalletIsConnected = async () => {
    try{
      const {ethereum} = window;

      if(!ethereum){
        console.log("Make sure you have Metamask!");
        return;
      } else {
        console.log("We have ethereum object", ethereum);
      }

      const accounts = await ethereum.request({method: "eth_accounts"});

      if(accounts.length !==0){
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
      } else {
        console.log("No authorized account found");
      }
    } catch(error) {
      console.log(error);
    }
  }

  const connectWallet = async () => {
    try{
      const {ethereum} = window;

      if(!ethereum){
        alert("Get Metamask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts"});
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
      getTotalWaves();
      getAllWaves();
    } catch (error) {
      console.log(error)
    }
  }

  const getTotalWaves = async () => {
    try{
      const {ethereum} = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await wavePortalContract.getTotalWaves();
        console.log("Recieved total wave count :", count.toNumber());
        setTotalWaves(count.toNumber());
      } else {
        console.log("Ethereum object dosen't exist.")
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(()=>{
    checkIFWalletIsConnected();
    getTotalWaves();
    getAllWaves();
  }, [])

  const wave = async () => {
    setEnterMessage(true);
    if(message.length===0) {
      setMessageAlert(true);
      return;
    }
    setMessageAlert(false);
    try{
      const {ethereum} = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await wavePortalContract.getTotalWaves();
        console.log("Recieved total wave count :", count.toNumber());

        const waveTxn = await wavePortalContract.wave(message);
        console.log("Mining ...", waveTxn.hash);
        setMining(true);
        setMessage("");
        setEnterMessage(false);
        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);
        setMining(false);
        getTotalWaves();
        getAllWaves();
      } else {
        console.log("Ethereum object dosen't exist!");
      }
    } catch (error) {
      console.log(error)
    }
    setMessage("");
    setEnterMessage(false);
  }

  const getAllWaves = async () => {
    try{
      const {ethereum} = window;
      if(ethereum){
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        const waves = await wavePortalContract.getAllWaves();
        console.dir(waves)

        let wavesCleaned = waves.map(item=>{return {address: item.waver, timestamp: new Date(item.timestamp.toNumber()*1000).toString(), message: item.message}})
        console.dir(wavesCleaned)
        setAllWaves(wavesCleaned);
      } else {
        console.log("Ethereum object not found")
      }
    } catch (error) {
      console.log(error)
    }
  }
  
  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
        👋 Hey there!
        </div>

        <div className="bio">
        I am Akhil Bidhuri and I work at BitGo currently. Connect your Ethereum wallet and wave at me!
        </div>

        {enterMessage===true &&
          <div className="waveDiv">
            <h5>Type in your message</h5>
            {messageAlert===true &&
              <p style={{color: "red"}}>Please enter a message.</p>
            }
            <input type="text" onChange={(event)=>{setMessage(event.target.value)}} value={message}></input>
          </div>
        }

        <button className="waveButton" onClick={wave}>
          Wave at Me
        </button>
        {mining && 
          <h4>Mining ...</h4>
        }
        {!currentAccount && 
          <button className="waveButton" onClick={connectWallet}>
            Connnect Wallet
          </button>
        }
        <h5>Total Waves: {totalWaves}</h5>
        {allWaves.map(wave=>(<div className="waveDiv">
          <h5>Waver: {wave.address}</h5>
          <h5>Message: {wave.message}</h5>
          <h5>Timestamp: {wave.timestamp}</h5>
        </div>))}
      </div>
    </div>
  );
}
