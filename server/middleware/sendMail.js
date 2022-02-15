var nodemailer = require('nodemailer');
const EmailErrors = require("../models/emailErrors");

var transporter = nodemailer.createTransport({
  host: process.env.HOST_EMAIL,
  port: 587,
  secure: false,
  auth: {
    user: process.env.USER_MAIL,
    pass: process.env.PASSWORD_EMAIL
        
  },
  tls:{
     secureProtocol: "TLSv1_method"
  }
});


/** Envio de email 
* @param email
* @param subjectTxt
* @param contentHTML
*/
let sendEmail = (email,subjectTxt,contentHTML) => {
    transporter.sendMail(
      {
        from: '"Admin Utopia Pagos" <admin@strongerdoge.com>',
        to: email,
        subject : subjectTxt,
        html: contentHTML
      }, function(error, info){
        if (error) {                  
          let emailError = new EmailErrors({            
            body: contentHTML,
            email,
            status: true,
            subject: subjectTxt,
            error,
            fecha: new Date()
          });      

          console.log('emailError: ' + emailError);

          emailError.save((err, emailError) => {
            if(err){
              console.log('error in save emailError ',err);
            }
          });        
        } else {      
          console.log('Email sent: ' + info.response);
        }
    }); 
}

let sendEmailWithParams = (userDB,subjectTxt,contentHTML) => {
    transporter.sendMail(
      {
        from: '"Admin Utopia Pagos" <admin@strongerdoge.com>',
        to: userDB.email,
        subject : subjectTxt,
        html: contentHTML
      }, function(error, info){
      if (error) {        
        console.log('Email error: ' + error);
        let emailError = new EmailErrors({
          user: userDB,
          body: contentHTML,
          email: userDB.email,
          status: true,
          subject: subjectTxt,
          error,
          fecha: new Date()
        });      
        emailError.save((err, emailError) => {
          if(err){
            console.log('error in save emailError ',err);
          }
        });        
      } else {      
        console.log('Email sent: ' + info.response);
      }
    });  
}


let sendEmailComent = (name,email,subjectTxt,contentHTML) => {

  return new Promise((resolve, reject) => {
    transporter.sendMail(
      {
        from:  'admin@strongerdoge.com',
        to: 'strongerdoge@gmail.com',
        subject : subjectTxt,
        html: 'name: '+name+ '<br>email: '+email+'<br>'+contentHTML,
      }, function(error, info){
      if (error) {
        console.log('Email error: ' + error);
        reject(error);        
      } else {
        console.log('Email sent: ' + info.response);
        resolve(info.response);        
      }
    }); 
  });
}

module.exports = {
  sendEmail,
  sendEmailComent,
  sendEmailWithParams
};