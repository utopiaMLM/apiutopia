Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/v3/1164d51c65b44a57b85d10568558dc9d'));
const secp256k1 = require('secp256k1');
const keccak = require('keccak');
const randomBytes = require('randombytes');
const CONST = require("../commons/constants");

/** Genera una wallet */
let generateWallet = () =>{
  let keyprivate = randomBytes(32);
  const pub = privateKeyToAddress(keyprivate);
  const valorKey = keccak('keccak256').update(pub).digest().slice(-20).toString('hex');
  const fromAddress = web3.utils.toChecksumAddress(valorKey.toString('hex'));
  keyprivate = keyprivate.toString('hex')  
  const publikey= pub.toString('hex');
  return {publikey, keyprivate, fromAddress}
};

  /**
  * Generate/Read if exist a wallet with private key 
  * @param privateKey
  */
  function privateKeyToAddress(privateKey) {
    return secp256k1.publicKeyCreate(privateKey, false).slice(1);    
  }


  /** 
  * Read the eth balance from wallet 
  * @param walletAddress
  */
  let readETHBalance = (walletAddress) =>{
    return new Promise((resolve, reject) => {    
      web3.eth.getBalance(walletAddress)
      .then(function(result) {        
        let cantETH = web3.utils.fromWei(result, 'ether');
        resolve(cantETH);
      }).catch(e => {
        reject(e)
        console.log("e -> ", e);
      });
    });
  };


  /** 
  * Read the tokens Balance
  *  @param smartContract
  *  @param walletAddress
  */
  let getERC20TokenBalance= (smartContract, walletAddress) => {
    return new Promise((resolve, reject) => {
    let minABI = [
    {
      "constant":true,
      "inputs":[{"name":"_owner","type":"address"}],
      "name":"balanceOf",
      "outputs":[{"name":"balance","type":"uint256"}],
      "type":"function"
    },
    {
      "constant":true,
      "inputs":[],
      "name":"decimals",
      "outputs":[{"name":"","type":"uint8"}],
      "type":"function"
    }
    ];
    
    var contract = new web3.eth.Contract(minABI, smartContract);
    contract.methods.balanceOf(walletAddress).call().then(function(result){
      var tokens = result;
      contract.methods.decimals().call().then(function (result) {
        var decimals = result;        
        tokenBalance = parseFloat(tokens) / Math.pow(10, decimals);        
        resolve(tokenBalance);
      }).catch(e => {
      
        console.log("error smart contract -> ", e)
        reject(e)
      
      });	
     });
    });
  }

  /** 
  * Lee balance Ethereum y tokens 
  *  @param walletAddress
  *  @param blockchain
  *  @param smartContract
  *  @param symbol
  * */
  let readBalanceETH = (walletAddress,smartContract,symbol) =>{

    if(smartContract === undefined ){
      return new Promise((resolve, reject) => {    
        readETHBalance(walletAddress).then(ethBalance=>{     
          const dataResponse = {walletAddress, balance:{'symbol': symbol, 'balance': ethBalance}}     
          resolve(dataResponse); 
      }).catch(errETH => {
        reject(errETH);       
      });      
    });

    }else{
      return new Promise((resolve, reject) => {    
        getERC20TokenBalance(smartContract,walletAddress).then(tokenBalance=>{
          const dataResponse = {walletAddress, balance:{'symbol': symbol, 'balance': tokenBalance}}
          resolve(dataResponse);
          }).catch(errToken => {
            reject(errToken);       
          });
      });
    }
  }


module.exports = {
  generateWallet, readBalanceETH
};