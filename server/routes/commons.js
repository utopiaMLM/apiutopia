const express = require("express");
const cors = require('cors');
const jwt = require("jsonwebtoken");
const emailModule = require("../middleware/sendMail");
const {templateComment }= require("../template/template_email");
const City = require("../models/city");
const Country = require("../models/country");
const Blockchain = require("../models/blockchain");
const BlockchainsUser = require("../models/blockchains_user");
const CryptoCurrency = require("../models/cryptocurrency");
const WalletUser = require("../models/wallet_user");
const axios = require('axios');
const fs = require('fs');
const got = require('got');
const { JSDOM } = require('jsdom');
const {
  verificaToken,
  validateCaptcha

} = require("../middleware/autenticacion");
const app = express();
app.use(cors());

/**
 * Obtiene todas las wallets del usuario
 */
app.post("/api/commons/getAllWalletsUser", [verificaToken], (req, resp) => {
  let body = req.body;
  const usuarioId = req.usuarioid;
    
  WalletUser.find({ user: usuarioId },"id walletblockchains")
  .exec((err, walletsu) => {   
    
    if (err) {
      return resp.status(400).json({
        ok: false
      });
    }

    if(walletsu && walletsu.length>0){
      resp.json({
        data: walletsu[0]
      });
    }else{
      resp.json({
        data: null
      });
    }
  });

});

/**
 * Guarda las wallets del usuario
 */
 app.post("/api/commons/saveWallets", [verificaToken], (req, resp) => {

  let body = req.body;
  const usuarioId = req.usuarioid;
    
  WalletUser.find({ user: usuarioId })
  .exec((err, walletsu) => {   
    
    if (err) {
      return resp.status(400).json({
        ok: false
      });
    }


    if(walletsu.length > 0) {
      
      const update = {walletblockchains: body.walletblockchains, creation_date: new Date()}

      WalletUser.findOneAndUpdate(
        { _id: walletsu[0]._id },update
        ).exec((err, walletUdapte) => {
          if (err) {
            return resp.status(500).json({
              ok: false,
              err,
            });
          }
          if (!walletUdapte) {
            return resp.status(400).json({
              ok: false,
              err: {
                err
              },
            });
          }else{
            resp.json({
              ok: true,
              saved: true,
            });
          }   
        });  
      }else if(walletsu.length == 0){

            let walletUser = new WalletUser({ 
              user: usuarioId,
              walletblockchains: body.walletblockchains
            });

            walletUser.save((err, wallets) => {
              if (err) {
                return resp.status(400).json({
                  ok: false,
                  err,
                });
              }

              if(wallets){
                resp.json({
                  ok: true,
                  saved: true,
                });
              }
            });
      }        
    });
});


/**
 * Obtiene el precio de utopia
 */
app.post("/api/commons/getPriceUtopia", (req, resp) => {

  const vgmUrl= 'https://geckoterminal.com/bsc/pools/0xe42b62d2de88d575972b84b95f153bd03765533e';

  got(vgmUrl).then(response => {
    const dom = new JSDOM(response.body);
    var price =  dom.window.document.querySelector("[data-price-target='price']").textContent;
    price = price.replace('$','');
    return resp.json({
      ok: true,
      data: parseFloat(price)
    });
  }).catch(err => {
    console.log(err);
    return resp.status(400).json({
      ok: false,
      error,
    });  
  });

});

/**
 * Obtiene el precio de una moneda de coingecko
 */
app.post("/api/commons/getCryptoCurrencyGecko", (req, resp) => {

  let body = req.body;
  let symbol = body.symbol;

  getQueryCoinGecko(body.url)
    .then(resultado => {
      return resp.json({
        ok: true,
        data: resultado.data[symbol]
      });

    }).catch(error => {
      return resp.status(400).json({
        ok: false,
        error,
      });  
    });
});



/** 
 * Envia comentarios
 * */
app.post("/api/commons/sendcoments", [validateCaptcha], (req, resp) => {

  let body = req.body;
  const subject = "Comment sent";
  let datos =templateComment();   
  datos= datos.replace('$email',body.email);        
  datos= datos.replace('$name',body.name);        
  datos= datos.replace('$comment',body.comment);       
  
  emailModule.sendEmailComent(body.name,body.email,subject, datos)
  .then(result=>{
    resp.json({
      ok: true,
      send: true,
    });             
  }).catch(err => {
    console.log('Error in email ',err);
    return resp.status(400).json({
      ok: false,
      err: {
        erroremail: true,
      },
    });
  });  
});

/** 
 * Obtiene paises 
 * */
app.post("/api/commons/getCountries", (req, resp) => {
  Country.find({ status: true }, "name code id")
    .exec((err, countries) => {
      if (err) {
        return resp.status(400).json({
          ok: false,
          err,
        });
      }
      resp.json({
        ok: true,
        countries
      });
    });
});

/**
 * Registra un país
 */
app.post("/api/commons/saveCountries",  (req, res) => {

  let body = req.body;
  
  let country = new Country({
    name: body.name,
    code: body.code,
    status:true
  });

  country.save((err, country) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        err,
      });
    }

    res.json({
      ok: true,
      saved: true,
    });
  });
});


/**
 * Registra una ciudad
 */
app.post("/api/commons/saveCities",  (req, res) => {

  let body = req.body;
  
  let city = new City({
    name: body.name,
    country: body.country,
    status:true
  });

  city.save((err, country) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        err,
      });
    }
    res.json({
      ok: true,
      saved: true,
    });
  });
});

/** 
 * Obtiene ciudades 
 * */
app.post("/api/commons/getCities", [verificaToken], (req, resp) => {
  let body = req.body;
  const countryId= body.country;
  City.find({ status: true , country: countryId}, "name country id")
    .exec((err, cities) => {
      if (err) {
        return resp.status(400).json({
          ok: false,
          err,
        });
      }
      resp.json({
        ok: true,
        cities
      });
    });
});


/**
 * Registra un blockhain
 */
app.post("/api/commons/saveBlockchain", (req, res) => {

  let body = req.body;
  
  let blockchain = new Blockchain({
    name: body.name,
    timeout: body.timeout,
    image: body.image,
    symbol: body.symbol,
    status:true
  });

  blockchain.save((err, blockchain) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        err,
      });
    }
    res.json({
      ok: true,
      saved: true,
    });
  });
});

/** 
 * Obtiene blockchain
 * */
app.post("/api/commons/getBlockchains", (req, resp) => {
  
  let body = req.body;
  
  Blockchain.find({status:true}, "status name symbol image id timeout")
    .exec((err, blockchain) => {
      if (err) {
        return resp.status(400).json({
          ok: false,
          err,
        });
      }
      resp.json({
        ok: true,
        data: blockchain
      });
    });
});

app.post("/api/commons/getAllBlockchains", (req, resp) => {
  
  let body = req.body;
  
  Blockchain.find({}, "status name symbol image id timeout")
    .exec((err, blockchain) => {
      if (err) {
        return resp.status(400).json({
          ok: false,
          err,
        });
      }
      resp.json({
        ok: true,
        data: blockchain
      });
    });
});

/**
 * Registra una criptomoneda
 */
app.post("/api/commons/saveCryptoCurrency", (req, res) => {

  let body = req.body;
  
  let cryptoCurrency = new CryptoCurrency({ 
    name: body.name,
    url: body.url,
    image: body.image,
    symbol: body.symbol,
    blockchain:body.blockchain,
    smartcontract: body.smartcontract,
    status: true,
    blockchainSymbol: body.blockchainSymbol,
    namequery: body.namequery
  });

  cryptoCurrency.save((err, crypto) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        err,
      });
    }
    res.json({
      ok: true,
      saved: true,
    });
  });
});

/** 
 * Obtiene criptmonedas 
 * */
app.post("/api/commons/getCryptoCurrency", (req, resp) => {

  let body = req.body;

  CryptoCurrency.find({ status: true})
    .exec((err, cryptocurrency) => {
      if (err) {
        return resp.status(400).json({
          ok: false,
          err,
        });
      }
      resp.json({
        ok: true,
        data: cryptocurrency
      });
    });
});


const getQueryCoinGecko = async(url) => {
  const resp = await axios.get(url);
  if (resp.length === 0) {
      throw new Error(`no result`);
  }
  return resp;
}

/**
 * Obtiene las criptomonedas de un usuario 
 * */
app.post("/api/getCryptosByProfileById", (req, resp) => {  
  
  const body = req.body;
  const userId = body.userId;

  BlockchainsUser.findOne(
    { user: userId }
  ).exec((err, blocks) => {    
      if (err) {
        return resp.status(500).json({
          ok: false,
          err,
        });
      }
      if (!blocks) {
        return resp.status(400).json({
          ok: false,
          err: {
            blocks_user_notfound: true,
          },
        });
      }

      Blockchain.find(  { '_id': { $in: blocks.blockchains } }, "name symbol")
      .exec((err, blockchains) => {
        if (err) {
          return resp.status(400).json({
            ok: false,
            err,
          });
        }

        CryptoCurrency.find(
          { 'blockchain': { $in: blocks.blockchains } }
        ).exec((err, cryptos) => {    
            if (err) {
              return resp.status(500).json({
                ok: false,
                err,
              });
            }
            if (!cryptos) {
              return resp.status(400).json({
                ok: false,
                err: {
                  cryptos_notfound: true,
                },
              });
            }

      
      let resp_crypt = [];      
        blockchains.forEach(blocks_resp => {
          let blocksArray = blocks_resp;
          let cryptosArray = cryptos.filter(data => data.blockchain[0] +"" === blocksArray._id+"");
          if(cryptosArray.length>0){   
            resp_crypt.push({cryptosArray, blocksArray});          
          }              
        });

        resp.json({
          ok: true,
          cryptos: resp_crypt
        });

        });
      });
    });
});


module.exports = app;