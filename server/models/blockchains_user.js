const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let blockchainUserSchema = new Schema({
  user:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "user_account"
  },
  
  blockchains:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: "blockchain"
  }],
  
  creation_date: {
    type: Date,
    default: new Date()
  },
});

blockchainUserSchema.methods.toJSON = function() {

    let blockchainUser = this;
    let blockchainUserObject = blockchainUser.toObject();
    delete blockchainUserObject.__v;

    return blockchainUserObject;

}

module.exports = mongoose.model('blockchain_user', blockchainUserSchema);