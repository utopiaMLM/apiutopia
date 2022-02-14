const mongoose = require('mongoose');
let Schema = mongoose.Schema;

let walletsSchema = new Schema({

  user:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: "user_account"
  }],
  
  blockchain:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: "blockchain"
  }],

  wallet: {
      type: String,   
      required: [true, 'requerid'],
      trim: true
  },

  private_key: {
    type: String,   
    required: [true, 'requerid'],
    trim: true
  },

  public_key: {
    type: String,   
    trim: true
  },

  creation_date: {
    type: Date,
    default: new Date()
  },
  
  status: {
      type: Boolean,
      default: true
  }
});


walletsSchema.methods.toJSON = function() {

    let wallets = this;
    let walletsObject = wallets.toObject();
    delete walletsObject.__v;

    return walletsObject;

}

module.exports = mongoose.model('wallets', walletsSchema);