const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let transactionErrorSchema = new Schema({
    transaction:{
      type: String,      
      required: [true, 'required'],
    },    
    user_id_utopia:{
      type: String,
      required: [true, 'required'],
    },
    new_package_id:{
      type: Number,  
      required: [true, 'required'],
    },
    creation_date: {
        type: Date,
        default: new Date()
    },
    status: {
        type: String,
        default: 'active'
    }
});

transactionErrorSchema.methods.toJSON = function() {

    let transactionError = this;
    let transactionErrorObject = transactionError.toObject();
    delete transactionErrorObject.__v;
    return transactionErrorObject;

}

module.exports = mongoose.model('transactionError', transactionErrorSchema);