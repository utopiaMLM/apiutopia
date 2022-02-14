const jwt = require("jsonwebtoken");
const axios = require('axios');

let verificaToken = (req, res, next) => {
  let body = req.body;
  let token = body.token;
  jwt.verify(token, process.env.SEED, (err, decoded) => {    

    if (err) {      
      return res.status(401).json({
        ok: false,
        err: {
          tokeninvalid: true,
        },
      });
    }
    req.usuarioid = decoded.id;
    next();
  });
};

let verificaAdminRole = (req, res, next) => {
  let usuario = req.usuario;
  if (usuario.role != "ADMIN_ROLE") {
    return res.status(401).json({
      ok: false,
      err: {
        message: "no admin",
      },
    });
  }
  next();
};

let validateCaptcha = async(req,resp,next) => {
  let body = req.body;
  try {
    let result = await axios.post("https://www.google.com/recaptcha/api/siteverify", {}, {
        params: {
          secret: process.env.RECAPTCHA_V3_SECRET_KEY,
          response:  body.captcha_token 
        }
    });
    if(result.data.score < 0.5) {
      return resp.status(400).json({
        ok: false,
        err: {
          errorcaptcha: true,
        },
        msg: 'Google Recaptcha error'
      });
    }

    next();

  } catch(e) {
    console.log("error -> ",e);
    return resp.status(400).json({
      ok: false,
      err: {
        errorcaptcha: true,
      },
      msg: 'Error trying to verify the request'
    });
  }
}

module.exports = {
  verificaToken,
  verificaAdminRole,
  validateCaptcha
};
