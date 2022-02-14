const ethereum = require("../blockchains/ethereum");
const binance = require("../blockchains/binancesmartchain");
const tron = require("../blockchains/tron");
const CONST = require("../commons/constants");

/** Generar una wallet de algún blockchain*/
let saveWallet = (dataWallet,blockchain) => {  
  return new Promise((resolve, reject) => {    
     generateWallet(dataWallet,blockchain).then(result=>{
       
       dataWallet = result.dataWallet;
       const response = result.dataResponse;
 
       dataWallet.save((err, wallet) =>{
         if (err) {
           reject(err);        
         }else{        
           resolve({wallet,response});
         }
       });
 
       }).catch(err => {
         reject(err);   
       });   
   }); 
 }

/** Genera la wallet de un blockchain  */
let generateWallet = (dataWallet,blockchain) => {
  
  return new Promise((resolve, reject) => { 

  /** para ethereum */
  if(blockchain.symbol === CONST.BLOCKCHAIN.ETHEREUM){
    let walletGenerated = ethereum.generateWallet();
    if(walletGenerated){
      dataWallet.wallet = walletGenerated.fromAddress;
      dataWallet.public_key= walletGenerated.publikey;
      dataWallet.private_key= walletGenerated.keyprivate;
      const dataResponse = {wallet: walletGenerated.fromAddress, blockchain};    
      resolve({dataWallet, dataResponse});
    }
  }
   /** para binance smart chain */
   if(blockchain.symbol === CONST.BLOCKCHAIN.BINANCESMARTCHAIN){
    let walletGenerated = binance.generateWallet();
    if(walletGenerated){
      dataWallet.wallet = walletGenerated.fromAddress;
      dataWallet.public_key= walletGenerated.publikey;
      dataWallet.private_key= walletGenerated.keyprivate;
      const dataResponse = {wallet: walletGenerated.fromAddress, blockchain};    
      resolve({dataWallet, dataResponse});
    }
  }
   /** para tron */
  if(blockchain.symbol === CONST.BLOCKCHAIN.TRON){
    tron.generateWallet().then(result=>{      
      dataWallet.wallet = result.address.base58;
      dataWallet.wallet_hex = result.address.hex;
      dataWallet.public_key= result.publicKey;
      dataWallet.private_key= result.privateKey;
      const dataResponse = {wallet: dataWallet.wallet, blockchain};
      resolve({dataWallet, dataResponse});
    }).catch(err => {
      reject(err);   
    });   
  }


  });
}

/** Lee el balance de un blokchain  */
let readBalanceBlockchain = (wallet,blockchain,tokenAddress,symbol) =>{
  return new Promise((resolve, reject) => {  
  
    /** para ethereum  */
    if(blockchain === CONST.BLOCKCHAIN.ETHEREUM){    
      ethereum.readBalanceETH(wallet,tokenAddress,symbol).then(result=>{
        resolve(result);
      }).catch(err => {
        reject(err);       
      });
    }

    /** para binance smart chain  */
    if(blockchain === CONST.BLOCKCHAIN.BINANCESMARTCHAIN){    
      binance.readBalanceBSC(wallet,tokenAddress,symbol).then(result=>{
        resolve(result);
      }).catch(err => {
        reject(err);       
      });
    }

    /** para tron */
    if(blockchain === CONST.BLOCKCHAIN.TRON){    
      tron.readBalanceTRON(wallet,tokenAddress,symbol).then(result=>{
        resolve(result);
      }).catch(err => {
        reject(err);       
      });
    }

 });
}


module.exports = {
  saveWallet,
  readBalanceBlockchain
};