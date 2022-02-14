const CONST = require("../commons/constants");

let templatePasswordLost = (LANG) => {  
  return CONST.EMAIL_TEMPLATE.PASWWORD_LOST[LANG];  
};
let templateSignUp = (LANG) => {
  return CONST.EMAIL_TEMPLATE.SIGNUP[LANG];  
};
let templateCreateTransaction = (LANG) => {
  return CONST.EMAIL_TEMPLATE.CREATETRANSACTION[LANG];
};
let templateAnulateTransaction = (LANG)=>{
  return CONST.EMAIL_TEMPLATE.ANULATETRANSACTION[LANG];
}
let templateTimeoutTransaction = (LANG)=>{
  return CONST.EMAIL_TEMPLATE.TIMEOUTTRANSACTION[LANG];
}
let templateSuccesTransaction = (LANG)=>{
  return CONST.EMAIL_TEMPLATE.SUCCESSTRANSACTION[LANG];
}
let templateIncompleteTransaction = (LANG)=>{
  return CONST.EMAIL_TEMPLATE.INCOMPLETETRANSACTION[LANG];
}
let templateCode = (LANG)=>{
  return CONST.EMAIL_TEMPLATE.LOGINCODE[LANG];
}
let templateComment = () => {
  return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no"><link href="https://getbootstrap.com/docs/4.4/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous"><meta name="theme-color" content="#563d7c"><style>.padding-top{padding-top:5%}</style></head><body> <main role="main"><div class="container marketing"> <header><div class="row"><div class="col-sm-12 col-md-6 col-lg-6"></div></div> </header><div class="row featurette padding-top"><div class="col-lg-12"><h2 class="featurette-heading">You have received a message</h2><p class="lead"> <b>Name</b>: $name</p><p class="lead"> <b>Email</b>: $email</p><p class="lead"> <b>Comment</b>: $comment</p> <br></div></div></div> </main> <script src="https://code.jquery.com/jquery-3.4.1.slim.min.js" integrity="sha384-J6qa4849blE2+poT4WnyKhv5vZF5SrPo0iEjwBvKU7imGFAV0wwj1yYfoRSJoZ+n" crossorigin="anonymous"></script></body></html>';  
};
module.exports = {
  templatePasswordLost,
  templateSignUp,
  templateComment, 
  templateCreateTransaction,
  templateAnulateTransaction,
  templateSuccesTransaction,
  templateIncompleteTransaction,
  templateTimeoutTransaction,
  templateCode
};