import { Contract, ethers } from "ethers";
import React, {useState, useEffect} from "react";
import abi from './utils/waveportal.json'
import './App.css';

export default function App() {
  const [currentAccount, setCurrentAccount] = useState("");
  const [totalWaves, setTotalWaves] = useState("Couldn't retrieve");
  const [mining, setMining] = useState(false);

  const contractAddress  = "0xbB072bFdb2b3D0eA203238879De43437eC98A63b";
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

    }
  }

  useEffect(()=>{
    checkIFWalletIsConnected();
    getTotalWaves();
  }, [])

  const wave = async () => {
    try{
      const {ethereum} = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await wavePortalContract.getTotalWaves();
        console.log("Recieved total wave count :", count.toNumber());

        const waveTxn = await wavePortalContract.wave();
        console.log("Mining ...", waveTxn.hash);
        setMining(true);
        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);
        setMining(false);
        getTotalWaves();
      } else {
        console.log("Ethereum object dosen't exist!");
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
      </div>
    </div>
  );
}
