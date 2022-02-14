const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let transactionSchema = new Schema({
   amount: {
        type: Number,  
        required: [true, 'required'],
    },
    blockchain:[{
      type: mongoose.Schema.Types.ObjectId,
      ref: "blockchain"
    }],    
    user:[{
      type: mongoose.Schema.Types.ObjectId,
      ref: "user_account"
    }],
    clientEmail:{
      type: String
    },
    clientName:{
      type: String
    },
    cryptoSelected:[{
      type: mongoose.Schema.Types.ObjectId,
      ref: "cryptoCurrency"
    }],
    cryptoToSend:{
      type: Number,  
      required: [true, 'required'],
    },    
    description: {
      type: String
    },
    priceCryptoSelected:{
      type: Number,  
      required: [true, 'required'],
    },
    purchaseId: {
      type: String
    },
    symbol: {
      type: String
    }, 
    blockchainSymbol: {
      type: String
    },
    timeout: {
      type: Number
    },    
    creation_date: {
        type: Date,
        required: [true, 'required'],
    },
    processdate: {
      type: Date
    },
    status: {
        type: Number
    },
    walletAddress: {
      type: String
    },
    smartcontract:{
      type: String
    },
    wallet:[{
      type: mongoose.Schema.Types.ObjectId,
      ref: "wallets"
    }],
});

transactionSchema.methods.toJSON = function() {

    let transaction = this;
    let transactionObject = transaction.toObject();
    delete transactionObject.__v;
    return transactionObject;

}

module.exports = mongoose.model('transaction', transactionSchema);