const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

let Schema = mongoose.Schema;

let blockchainSchema = new Schema({
    name: {
        type: String,        
        unique: true,
        required: [true, 'requerid'],
        trim: true
    },
    symbol: {
      type: String,        
      lowercase: true,
      unique: true,
      required: [true, 'requerid'],
      trim: true
    },
    image: {
      type: String,
    },
    status: {
        type: Boolean,
        default: true
    },
    timeout: {
      type: Number
    }
});

blockchainSchema.plugin(uniqueValidator, { message: '{PATH} debe ser unico' })

blockchainSchema.methods.toJSON = function() {

    let blockchain = this;
    let blockchainObject = blockchain.toObject();
    delete blockchainObject.__v;

    return blockchainObject;

}

module.exports = mongoose.model('blockchain', blockchainSchema);