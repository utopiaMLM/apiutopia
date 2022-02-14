const express = require("express");
const cors = require('cors');
const bcrypt = require("bcrypt");
const _ = require("underscore");
const Usuario = require("../models/usuarios");
const BlockchainsUser = require("../models/blockchains_user");
const Blockchains = require("../models/blockchain");
const {templateSignUp }= require("../template/template_email");
const emailModule = require("../middleware/sendMail");
const CONST = require("../commons/constants");

const {
  verificaToken,
  validateCaptcha
} = require("../middleware/autenticacion");

const app = express();
app.use(cors());


/**
 * Registra un usuario
 */
app.post("/api/signup",[validateCaptcha],(req, res) => {
  let body = req.body;
  const subject_ = body.subject; 

  let LANG= 'EN';
  if(body.lang != undefined){
    LANG= body.lang;
  }

  const passwordbcrypt = bcrypt.hashSync(body.password, 10);

  let usuario = new Usuario({
    email: body.email,
    status:false,
    password: passwordbcrypt,
    name: body.name,
  });

  //Guarda el usuario
  usuario.save((err, usuarioDB) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        err,
      });
    }

    //Busca los blockchains
    Blockchains.find({        
      'symbol': { $in: CONST.BLOCKCHAIN_DEFAULT }
    }).exec((err, block) => {    
      if (err) {
        return res.status(500).json({
          ok: false,
          err,
        });
      }
      if (!block) {
        return res.status(400).json({
          ok: false,
          err: {
            blocknotfound: true,
          },
        });
      }

      let blockchains_user = new BlockchainsUser({
        user: usuarioDB._id,
        creation_date: new Date(),     
      })
      blockchains_user.blockchains = block;
      
      //Guarda los blockchains
      blockchains_user.save((err, block_save) => {        
        if (err) {
          return res.status(400).json({
            ok: false,
            err,
          });
        }

        let datos =templateSignUp(LANG);
        const link = process.env.URLBASE + "activate_user?id=" + usuarioDB.id;        
        datos= datos.replace('$link', link);
        datos= datos.replace('$user_replace', body.name);        
    
        //Envia el correo
        emailModule.sendEmailWithParams(usuarioDB,subject_, datos);
        
        res.json({
            ok: true,
            signed: true,
        });
      });          
    });
  });
});

/**
 * Obtiene los blockchains de un usuario 
 * */
app.post("/api/getBlockchainsUser", verificaToken, (req, resp) => {  
  
  const usuarioId = req.usuarioid;

  BlockchainsUser.findOne(
    { user: usuarioId }
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
      resp.json({
        ok: true,
        blockchains: blocks.blockchains
      });     
    });
});


/**
 * Actualiza los blockchains de un usuario 
 * */
app.post("/api/updateBlockchainsUser", verificaToken, (req, resp) => {  
  
  let body = req.body;
  const blockchains = body.blockchains; 
  const usuarioId = req.usuarioid;

  const update = { blockchains };

  BlockchainsUser.findOneAndUpdate(
    { user: usuarioId },update,{
      returnOriginal: false,
      upsert: true,
    }
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
      resp.json({
        ok: true,
        blockchains: blocks.blockchains
      });     
    });
});


/**
 * Obtiene un rol de un usuario per primero verifica el token
 */
app.post("/api/getRoleUser", verificaToken, (req, resp) => {  
    
  const usuarioId = req.usuarioid;

  Usuario.findOne(
    { _id: usuarioId }
  ).exec((err, usuario) => {    
      if (err) {
        return resp.status(500).json({
          ok: false,
          err,
        });
      }
      if (!usuario) {
        return resp.status(400).json({
          ok: false,
          err: {
            usernotfound: true,
          },
        });
      }
      resp.json({
        ok: true,
        role: usuario.role
      });     
    });
});


/**
 * Obtiene un rol de un usuario per primero verifica el token
 */
app.post("/api/changepassword", verificaToken, (req, resp) => {  
    
  const usuarioId = req.usuarioid;
  const body = req.body;

  Usuario.findOne(
    { _id: usuarioId },"password email"
  ).exec((err, usuario) => {    
      if (err) {
        return resp.status(500).json({
          ok: false,
          err,
        });
      }
      if (!usuario) {
        return resp.status(400).json({
          ok: false,
          err: {
            usernotfound: true,
          },
        });
      }          
     
      if (!bcrypt.compareSync(body.oldpassword, usuario.password)) {
        return resp.status(400).json({
          ok: false,
          err: {
            nomatch: true,
          },
        });
      }else  if (bcrypt.compareSync(body.newpassword, usuario.password)){
        return resp.status(400).json({
          ok: false,
          err: {
            samepassword: true,
          },
        });
      } 
      const password = bcrypt.hashSync(body.newpassword, 10);
      update = {password}      

      /** Actualiza el password del usuario */
      Usuario.findOneAndUpdate(
      { _id: usuarioId },update
    ).exec((err, user) => {
        if (err) {
          return resp.status(500).json({
            ok: false,
            err,
          });
        }
        if (!user) {
          return resp.status(400).json({
            ok: false,
            err: {
              usernotfound: true,
            },
          });
        }      
        //Enviar correo a futuro      
        resp.json({
          ok: true,
          updatepassword:true
        });          
      });
  });
}); 

module.exports = app;