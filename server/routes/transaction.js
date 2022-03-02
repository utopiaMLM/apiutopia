const express = require("express");
const cors = require('cors');
const Transaction = require("../models/transaction");
const Wallets = require("../models/wallets");
const CryptoCurrency = require("../models/cryptocurrency");
const Blockchain = require("../models/blockchain");
const Usuario = require("../models/usuarios");
const TransactionError = require("../models/transactionError");

const axios = require('axios');
const {
  templateCreateTransaction,
  templateAnulateTransaction,
  templateTimeoutTransaction,
  templateSuccesTransaction,
  templateIncompleteTransaction
}= require("../template/template_email");
const emailModule = require("../middleware/sendMail");
const CONST = require("../commons/constants");
const wallletBackend = require("../backend_blockchains/wallet");
const {
  verificaToken
} = require("../middleware/autenticacion");
const app = express();
app.use(cors());



const sendResponse = async(userId, packageId, transactionId) => {
  //const resp = await axios.get(`http://localhost/office/login/payment?user_id=${userId}&package_id=${packageId}&transaction_id=${transactionId}`);
  const resp = await axios.get(`http://localhost/office/login/payment?user_id=${userId}&package_id=${packageId}&transaction_id=${transactionId}`);

  console.log("resp ", resp);

  if (resp.length === 0) {
      console.log(`No hay resultados para ${userId}, ${packageId}, ${transactionId}`);
  }  
}

/** Pagos */
app.get("/api/transaction/payment",  (req, resp) => {
  
  const query= req.query;

  const user_id= query.user_id;
  const transaction_id= query.transaction_id;
  const new_package_id= query.new_package_id;

  let transactionError = new TransactionError({
    transaction: transaction_id,
    user_id_utopia: user_id,
    new_package_id: new_package_id
  }); 

  transactionError.save((err, result) => {
    if (err) {

      console.log(err)
      resp.json({
        ok: false
      });
    }
    resp.json({
      ok: true
    });
  }); 

});

/** Crea una transaccion del gateway de pago */
app.post("/api/transaction/generateTransaction", (req, resp) => {  
    
  const body = req.body;
  const subject = body.subject;
  let LANG= 'EN';
  if(body.lang != undefined){
    LANG= body.lang;
  }

  let transaction = new Transaction({
    amount: body.amount,
    blockchain:  body.blockchainSelected,
    clientEmail: body.clientEmail,
    clientName: body.clientName,
    cryptoSelected: body.cryptoSelected,
    userId:  body.userId,
    packageId:  body.packageId,
    cryptoToSend: body.cryptoToSend,
    description: body.description,
    priceCryptoSelected: body.priceCryptoSelected,
    user: body.profileId,
    symbol: body.symbol,
    smartcontract: body.smartcontract,
    blockchainSymbol: body.blockchainSymbol,
    creation_date: new Date(),
    status: CONST.STATUS.PENDENT
  }); 


  //Busco el blockchain que me mandan del request
  Blockchain.findOne(
    { _id: body.blockchainSelected }, "name symbol timeout"
  ).exec((err, blockchain) => {
    
    if (err) {
      return resp.status(500).json({
        ok: false,
        err,
      });
    }

    //No existe el blockchain
    if (!blockchain) {
      return resp.status(400).json({
        ok: false,
        err: {
          blockchainotfound: true,
        }
      });
    }

  //Genero el objecto Wallet
  let dataWallet= new Wallets({
    blockchain,
    user: body.profileId
  });  
  

  //Creo nueva wallet
  wallletBackend.saveWallet(dataWallet,blockchain).then(result=>{

    transaction.wallet = result.wallet._id;    
    transaction.walletAddress = result.wallet.wallet;
    transaction.timeout= blockchain.timeout;    
 
    transaction.save((err, transaction) => {
      if (err) {
        return resp.status(400).json({
          ok: false,
          err,
        });
      }

      //envio correos
      let datos = templateCreateTransaction(LANG);
      datos= datos.replace('$id', transaction._id);              
      datos= datos.replace('$name', body.clientName);           
      datos= datos.replace('$date',transaction.creation_date);              
      datos= datos.replace('$monto', "$"+transaction.amount);                    
      datos= datos.replace('$moneda',transaction.cryptoToSend+" "+body.symbol);              
      datos= datos.replace('$wallet',result.wallet.wallet);              
      datos= datos.replace('$time',(blockchain.timeout/60));
      
      emailModule.sendEmail( body.clientEmail,subject,datos);

      resp.json({
        transactionId: transaction._id,
        wallet: result.wallet.wallet,      
        timeOut: blockchain.timeout
      });  
    }); 

    }).catch(err => {
      console.log("err -> ", err);
      return resp.status(400).json({
        ok: false,
        err: {
          walleterror: true,
        }
      });          
    });
  });
});


/** Anula transaccion */
app.post("/api/transaction/anulTransaction", (req, resp) => {
  const body = req.body;
  const subject = body.subject;
  const transactionId = body.transactionId;
  const update = {status: CONST.STATUS.CANCEL, processdate: new Date()} 


  let LANG= 'EN';
  if(body.lang != undefined){
    LANG= body.lang;
  }

  Transaction.findOneAndUpdate(
    { _id: transactionId },update
    ).exec((err, transaction) => {
      if (err) {
        return resp.status(500).json({
          ok: false,
          err,
        });
      }
      if (!transaction) {
        return resp.status(400).json({
          ok: false,
          err: {
            transactionnotfound: true,
          },
        });
      }   
      
      let datos = templateAnulateTransaction(LANG);
      datos= datos.replace('$id', transaction._id);              
      datos= datos.replace('$date',new Date());              
      datos= datos.replace('$total',transaction.cryptoToSend+" "+transaction.symbol);              
      datos= datos.replace('$wallet',transaction.walletAddress);
      emailModule.sendEmail(transaction.clientEmail,subject,datos);
      
      return resp.json({
        ok: true,
        success:true
      });         
    });
  });


/** Obtiene todas las transacciones de un perfil*/ 
app.post("/api/transaction/getLastTransactions", [verificaToken], (req, resp) => { 

  const usuarioId = req.usuarioid;
    
  Transaction.find({ user: usuarioId }).sort({creation_date: -1}).limit(10).exec((err, transactions) => {
    if (err) {      
      return resp.status(500).json({
        ok: false,
        err,
      });
    }

    if (!transactions) {
      return resp.status(400).json({
        ok: true,
        err: {
          transactionsnotfound: true,
        },
      });
    }else{

      return resp.json({
        ok: true,
        transactions
      });

    }
  });
});


/** Obtiene todas las transacciones de un perfil*/ 
app.post("/api/transaction/getAllTransactions", [verificaToken], (req, resp) => { 

  const usuarioId = req.usuarioid;
    
  Transaction.find(
    { user: usuarioId }
  ).exec((err, transactions) => {
    if (err) {      
      return resp.status(500).json({
        ok: false,
        err,
      });
    }

    if (!transactions) {
      return resp.status(400).json({
        ok: true,
        err: {
          transactionsnotfound: true,
        },
      });
    }else{

      return resp.json({
        ok: true,
        transactions
      });

    }
  });
});


/** Verifica la transaccion  para ver si llego el monto correspondiente a la wallet */ 
app.post("/api/transaction/checkTransaction", (req, resp) => { 
  const body = req.body;
  const transactionId = body.transactionId;  
  const subject = body.subject;

  
  let LANG= 'EN';
  if(body.lang != undefined){
    LANG= body.lang;
  }

  Transaction.findOne(
    { _id: transactionId }
  ).exec((err, transaction) => {

    if (err) {      
        return resp.status(500).json({
          ok: false,
          err,
        });
    }

     if (!transaction) {
        return resp.status(400).json({
          ok: false,
          err: {
            transactionnotfound: true,
          },
        });
    }

    CryptoCurrency.findOne({ _id: transaction.cryptoSelected})
      .exec((err, cryptocurrency) => {
      if (err) {
        return resp.status(400).json({
          ok: false,
          err: {
            cryptoerror: true,
          },
        });
      }

      if(!cryptocurrency){
        return resp.status(400).json({
          ok: false,
          err: {
            cryptonotfound: true,
          },
        });
      }


      Usuario.findOne(
        { _id: transaction.user[0] }
      ).exec((err, store) => {    
          if (err) {
            return resp.status(500).json({
              ok: false,
              err,
            });
          }
          if (!store) {
            return resp.status(400).json({
              ok: false,
              err: {
                usernotfound: true,
              },
            });
          }

          if(transaction.status ===  CONST.STATUS.ERROR){        
            return resp.json({
              ok: true,
              witherrors :true,
              transaction: createObjectTransaction(transaction,cryptocurrency,store)
            });

          }else if(transaction.status ===  CONST.STATUS.CANCEL){        
            return resp.json({
              ok: true,
              cancel: true,
              transaction: createObjectTransaction(transaction,cryptocurrency,store)
            });

          }else if(transaction.status ===  CONST.STATUS.SUCESSFULL){        
            return resp.json({
              ok: true,
              complete: true,
              transaction: createObjectTransaction(transaction,cryptocurrency,store)
            });

          }else if(transaction.status ===  CONST.STATUS.INCOMPLETE){
            return resp.json({
              ok: true,
              incomplete: true,
              transaction: createObjectTransaction(transaction,cryptocurrency,store)
            });

          }else if(transaction.status ===  CONST.STATUS.TIMEOUT){
            return resp.json({
              ok: true,
              timeout: true,
              transaction: createObjectTransaction(transaction,cryptocurrency,store)
            });       

          }else if(transaction.status ===  CONST.STATUS.PENDENT){

            
            //Verificar montos
            getAmounts(transaction).then(result=>{

              //Si el monto llega a la wallet
              if(result.balance.balance > 0 && result.balance.balance >= transaction.cryptoToSend){      
                
                updateStatusSuccessfull(transaction,LANG).then( resultUpdateSuccess=>{            
                  return resp.json({
                    ok: true,
                    complete: true,
                    transaction: createObjectTransaction(resultUpdateSuccess,cryptocurrency,store)
                  });
                
                }).catch(err => {      
                  return resp.status(500).json({
                  ok: false,
                  err,
                });
              });

              //El monto es incompleto
              }else if(result.balance.balance > 0 && result.balance.balance < transaction.cryptoToSend){

                const balance = result.balance.balance;
                updateStatusIcomplete(transaction, balance, LANG).then( resultUpdateIcomplete=>{            
                  return resp.json({
                    ok: true,
                    incomplete: true,
                    transaction: createObjectTransaction(resultUpdateIcomplete,cryptocurrency,store)
                  });
                
                }).catch(err => {      
                  return resp.status(500).json({
                  ok: false,
                  err,
                });
              });

              //Si no hay montos hay que revisar si esta timeout  
              }else{
                const secondBetweenTwoDate = Math.abs((new Date().getTime() - new Date(transaction.creation_date).getTime()) / 1000); 
                const timeout= transaction.timeout - secondBetweenTwoDate;

                if(timeout>10){

                  const transactionObject = createObjectTransaction(transaction,cryptocurrency,store);
                  transactionObject.isTimeOut= false;

                  return resp.json({
                    ok: true,
                    continue: true,
                    transaction: transactionObject                
                  }); 
            
                }else{

                  //Actualiza a timeout
                  updateStatusTimeout(transaction,LANG).then( resultUpdateTimeout=>{
                    return resp.json({
                      ok: true,
                      timeout: true,
                      transaction: createObjectTransaction(resultUpdateTimeout,cryptocurrency,store)
                    });
                  
                  }).catch(err => {      
                    return resp.status(500).json({
                    ok: false,
                    err,
                  });
                });
              }            
            }
            }).catch(err => {
              return resp.status(500).json({
                ok: false,
                err,
            });
          });
        }
      }); 
    });
  });    
});  


/** Verifica en background las transacciones este WS será llamado cada 5 minutos */ 
app.post("/api/transaction/checkTrxBackground", (req, resp) => { 
  const body = req.body;
  const subject = body.subject;
  const transactionId = body.transactionId;  

  let from = body.from || 0;
  from = Number(from);

  let limit = body.limit || 20;
  limit = Number(limit);

  let LANG= 'EN';
  if(body.lang != undefined){
    LANG= body.lang;
  }

  if(transactionId!=null){
    checkIndividualTransaction(transactionId, LANG, resp);     
  }else{
    checkTransactions(from, limit, LANG, resp);
  }  
});  


/** Obtiene los montos invertidos */ 
app.post("/api/transaction/getAmountTransactions", (req, res) => { 
  
  Transaction.find({ status: CONST.STATUS.SUCESSFULL })
    .exec((err, transactions) => {

      if (err) {
        return res.status(400).json({
          ok: false,
          err,
        });
      }

      proccessAmountsTransactions(transactions, res);
  
    }); 

});  

//Crea el objeto transaction que va a la respuesta
let proccessAmountsTransactions = (transactions, res) => {
  let total = 0;
  transactions.forEach(transaction => {     
    total = total + transaction.amount;
  });
  
  return res.json({
    ok: true,
    total,
    investors: transactions.length
  });
}

//Crea el objeto transaction que va a la respuesta
let createObjectTransaction = (transaction,cryptocurrency,store) => {
  const secondBetweenTwoDate = Math.abs((new Date().getTime() - new Date(transaction.creation_date).getTime()) / 1000); 
  const timeout= transaction.timeout - secondBetweenTwoDate;
  return{
    transactionId: transaction._id,
    symbol: transaction.symbol,    
    description: transaction.description,    
    cryptoToSend: transaction.cryptoToSend,
    wallet: transaction.walletAddress,      
    status: transaction.status,
    amount: transaction.amount,
    clientName: transaction.clientName,
    tokensPurchased: transaction.tokensPurchased,
    creationDate: transaction.creation_date,
    clientWallet: transaction.clientWallet,
    clientEmail: transaction.clientEmail,
    processdate: transaction.processdate,
    image: cryptocurrency.image,
    storeWeb: store.web,
    storeName: store.name,
    timeOut: timeout    
  }
}


// Actualiza la transaccion a exitosa 
let updateStatusSuccessfull = async (transaction,LANG) => {  
  return new Promise((resolve, reject) => {
      
      const update = {status: CONST.STATUS.SUCESSFULL, processdate: new Date()}
      Transaction.findOneAndUpdate({ _id: transaction._id },update,{returnOriginal: false}).exec((err, tran) => {

          if (err) {            
            reject(err);
          }
    
          if (!tran) {
            reject(tran);
          }  

          //Envia el correo correspondiente
          const subject = "Transaction processed successfully"; //CAMBIAR ESTE SUBJECT AL IDIOMA QUE ES 
          let datos = templateSuccesTransaction(LANG);
          datos= datos.replace('$id', tran._id);              
          datos= datos.replace('$date',new Date());              
          datos= datos.replace('$coins',tran.cryptoToSend+" "+tran.symbol);              
          datos= datos.replace('$wallet',tran.walletAddress);    
          emailModule.sendEmail(transaction.clientEmail, subject, datos);           
          resolve(tran);
          
          //Envia respuesta
          sendResponse(tran.userId, tran.packageId);

      });
   }); 
 }

// Actualiza la transaccion a incompleta 
let updateStatusIcomplete = (transaction,balance,LANG) => {  
  return new Promise((resolve, reject) => {
     
      const update = {status: CONST.STATUS.INCOMPLETE, processdate: new Date()}
      Transaction.findOneAndUpdate({ _id: transaction._id },update,{returnOriginal: false}).exec((err, tran) => {    
          if (err) {            
            reject(err);
          }
    
          if (!tran) {
            reject(tran);
          }  
          const subject = "Transaction incomplete";  //CAMBIAR ESTE SUBJECT AL IDIOMA QUE ES 
          const difference = balance - tran.cryptoToSend;                        
          let datos = templateIncompleteTransaction(LANG);
          datos= datos.replace('$id', transaction._id);              
          datos= datos.replace('$date',new Date());              
          datos= datos.replace('$coinrequest',tran.cryptoToSend+" "+tran.symbol);              
          datos= datos.replace('$coinsent',balance+" "+tran.symbol);              
          datos= datos.replace('$diffcoins',difference+" "+tran.symbol);                                  
          datos= datos.replace('$wallet',tran.walletAddress);    
          emailModule.sendEmail(tran.clientEmail,subject,datos);
          resolve(tran);
      });  
   }); 
 }

 // Verifica si la transaccion esta timeout
let updateStatusTimeout = (transaction,LANG) => {  
  return new Promise((resolve, reject) => {   
      const update = {status: CONST.STATUS.TIMEOUT, processdate: new Date()}           
      Transaction.findOneAndUpdate({ _id: transaction._id },update,{returnOriginal: false}).exec((err, tran) => {
        if (err) {            
          reject(err);
        }
  
        if (!tran) {
          reject(tran);
        }  

        const subject = "Transaction timeout"  //CAMBIAR ESTE SUBJECT AL IDIOMA QUE ES 
        let datos = templateTimeoutTransaction(LANG);
        datos= datos.replace('$id', tran._id);              
        datos= datos.replace('$date',new Date());              
        datos= datos.replace('$total',tran.cryptoToSend+" "+tran.symbol);              
        datos= datos.replace('$wallet',tran.walletAddress);
        emailModule.sendEmail(tran.clientEmail,subject, datos);
        resolve(tran);                  
      });  
   }); 
 }

// Chequea montos de una transaccion 
let getAmounts = (transaction) => {
  return new Promise((resolve, reject) => {  
    
      console.log("transaction.walletAddress, transaction.blockchainSymbol, transaction.smartcontract, transaction.symbol -> ", transaction.walletAddress, transaction.blockchainSymbol, transaction.smartcontract, transaction.symbol);
    
        wallletBackend.readBalanceBlockchain(transaction.walletAddress, transaction.blockchainSymbol, transaction.smartcontract, transaction.symbol)
        .then(result=>{
          resolve(result);             
        }).catch(err => {      
          reject(err);          
      }); 
   }); 
 }
 
 
//Chequea una sola transaccion
let checkIndividualTransaction = (transactionId, LANG, res) => {

  Transaction.findOne(
    { _id: transactionId }
  ).exec((err, transaction) => {
      
    if (err) {
        return res.status(500).json({
          ok: false,
          err,
        });
    }

     if (!transaction) {
        return res.status(400).json({
          ok: false,
          err: {
            transactionnotfound: true,
          },
        });
      }

      proccessTransaction(transaction,LANG);

      return res.json({
        ok: true          
      });

  });
}


//Chequea transacciones en lote al menos 20
let checkTransactions = (from, limit, LANG, res) => {

  Transaction.find({ status: CONST.STATUS.PENDENT })
    .skip(from)
    .limit(limit)
    .exec((err, transactions) => {

      if (err) {
        return res.status(400).json({
          ok: false,
          err,
        });
      }

      proccessTransactions (transactions,LANG );
      return res.json({
        ok: true          
      });

    }); 
}


//Procesa multiples transacciones
let proccessTransactions = (transactions,LANG) =>{

  transactions.forEach(transaction => { 
    proccessTransaction(transaction,LANG);
  });
}

//Procesa una transaccion
let proccessTransaction = (transaction,LANG) =>{

  getAmounts(transaction).then(result=>{

    //Si el monto llega a la wallet
    if(result.balance.balance > 0
       && result.balance.balance >= transaction.cryptoToSend){   
      updateStatusSuccessfull(transaction,LANG).then( resultUpdateSuccess=>{
        
      }).catch(err => {      
        console.log("err updateStatusSuccessfull -> ", err);
      });

    //El monto es incompleto
    }else if(result.balance.balance > 0 
      && result.balance.balance < transaction.cryptoToSend){

      const balance = result.balance.balance;
      updateStatusIcomplete(transaction, balance, LANG).then( resultUpdateIcomplete=>{            
        
      }).catch(err => {      
        console.log("err updateStatusIcomplete -> ", err);
    });

    //Si no hay montos hay que revisar si esta timeout  
    }else{
      const secondBetweenTwoDate = Math.abs((new Date().getTime() - new Date(transaction.creation_date).getTime()) / 1000); 
      const timeout= transaction.timeout - secondBetweenTwoDate;
      if(timeout<10){
        //Actualiza a timeout
        updateStatusTimeout(transaction,LANG).then( resultUpdateTimeout=>{
          
        }).catch(err => {      
          console.log("err updateStatusTimeout -> ", err);
      });
    }            
  }
  }).catch(err => {
    console.log("err -> ", err);
  });
}

 //Crea codigo QR
 let getQr = async (wallet) => {  
  try {
    return await QRCode.toDataURL(wallet)
  } catch (err) {
    console.error(err)
  }
 }

module.exports = app;