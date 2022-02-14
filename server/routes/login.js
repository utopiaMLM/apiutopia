const express = require("express");
const cors = require('cors');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const CONST = require("../commons/constants");
const emailModule = require("../middleware/sendMail");
const templatePasswordLost = require("../template/template_email");
const Usuario = require("../models/usuarios");
const UserCode = require("../models/userCode");

const randomstring = require("randomstring");
const {templateCode }= require("../template/template_email");
const {
  validateCaptcha,
  verificaToken
} = require("../middleware/autenticacion");
const app = express();
app.use(cors());



/** Autentica el usuario en el sistema */
app.post("/api/login",[validateCaptcha],(req, resp) => {
  
  let body = req.body;
  const subject_ = body.subject; 

  let LANG= 'EN';
  if(body.lang != undefined){
    LANG= body.lang;
  }

  Usuario.findOne({email: body.email }).exec((err, usuario) => {

    if (err) {
      return resp.status(500).json({
        ok: false,
        err,
      });
    }

    if(usuario) {
        if (!bcrypt.compareSync(body.password, usuario.password)) {
          return resp.status(400).json({
            ok: false,
            err: {
              user_error: true,
            },
          });
        }

        if (!usuario.status) {
          return resp.status(400).json({
            ok: false,
            err: {
              inactive: true,
            },
          });
        }       

        const codeGenerated = Math.floor(Math.random() * (9 * (Math.pow(10, 4)))) + (Math.pow(10,4));

        let userCode = new UserCode({
          user: usuario,
          codeGenerated,
          creationDate:  new Date()
        });

        userCode.save((err, userCodeDB) => {
          
          if (err) {
            return res.status(400).json({
              ok: false,
              err,
            });
          }

          let token = jwt.sign({
              exp: Math.floor(Date.now() / 1000) + 60 * 60 * 60,
              id:usuario.id,
            }, process.env.SEED
          );
  
          
          //Envio un codigo de 5 digitos al correo del usuario
          let datos = templateCode(LANG);

          datos= datos.replace('$code_generated', codeGenerated);
          datos= datos.replace('$user_name',usuario.name);        
      
          emailModule.sendEmailWithParams(usuario,subject_, datos);

          resp.json({
            ok: true,
            expiresToken: Math.floor(Date.now() / 1000) + 60 * 60 * 60,
            token
          });
          
        });

    }else{
      return resp.status(400).json({
        ok: false,
        err: {
          usernotfound: true,
        },
      }); 
    }
  });
});


/** Autentica el codigo de usuario enviado */
app.post("/api/validateCode",[verificaToken, validateCaptcha],(req, resp) => {

  const usuarioId = req.usuarioid;  
  let body = req.body;

  UserCode.findOne({user: usuarioId, codeGenerated: body.codeGenerated }).exec((err, userCode) => {

    if (err) {
      return resp.status(500).json({
        ok: false,
        err,
      });
    }

    if(userCode) {

      const dateNow = new Date();

       userCode.creationDate

      const diff = Math.abs(dateNow -  userCode.creationDate );
      const minutes = Math.floor((diff/1000)/60);
      
      if(minutes > CONST.MINUTES_CODE.MINUTES){
        return resp.status(400).json({
          ok: false,
          err: {
            minutes_exceed: true,
          },
        });
      }else{

        resp.json({
          ok: true
        });
      }  
    }else{
      return resp.status(400).json({
        ok: false,
        err: {
          usercodenotfound: true,
        },
      }); 
    }
  });
});




/** Genera una nueva clave para el usuario y la envia a su correo */
app.post("/api/passwordlost", [validateCaptcha], (req, resp) => {  
  let body = req.body;

  let LANG= 'EN';
  if(body.lang != undefined){
    LANG= body.lang;
  }

  Usuario.findOne(
    { email: body.email },"id status"
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
      if (!usuario.status) {
        return resp.status(400).json({
          ok: false,
          err: {
            inactive: true,
          },
        });
      }      

      const id = usuario._id
      const ramdon = randomstring.generate(13);      
      let passw= bcrypt.hashSync(ramdon, 10);
  
      Usuario.findByIdAndUpdate(
        id, { $set: { password: passw}},
        {useFindAndModify: false},
        (err, usuarioDB) => {
          if (err) {
            return resp.status(400).json({
              ok: false,
              err,
            });
          }  

          let datos = templatePasswordLost.templatePasswordLost(LANG);  
          datos= datos.replace('$password_replace',ramdon);
          datos= datos.replace('$user_replace',usuarioDB.username);          
          emailModule.sendEmail(body.email, body.subject, datos);
          
          resp.json({
            ok: true,
            changed: true,
          });              

      });         
    });
});

/** Activa el usuario status true */
app.post("/api/activateuser", (req, resp) => {
  
  let body = req.body;

  Usuario.findOne(
    { _id: body.iduser },"id status"    
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

      if (usuario.status) {
        return resp.status(400).json({
          ok: false,
          err: {
            active: true,
          },
        });
      }

      const id = usuario._id
      Usuario.findByIdAndUpdate(
        id, { $set: { status: true}},
        {useFindAndModify: false},
        (err, usuarioDB) => {
          if (err) {
            return resp.status(400).json({
              ok: false,
              err,
            });
          }  
          resp.json({
            ok: true,
            activate: true,
          });
        }
      );
    });
});

module.exports = app;
