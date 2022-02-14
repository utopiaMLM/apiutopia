const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

let Schema = mongoose.Schema;

let cryptoCurrencySchema = new Schema({

    blockchain:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "blockchain"
    }],
    name: {
        type: String,
        required: [true, 'requerid'],
        trim: true
    },
    smartcontract: {
        type: String
    },
    namequery: {
        type: String
    },
    url: {
        type: String
    },
    image: {
        type: String
    },
    decimals: {
        type: Number
    },
    symbol: {
      type: String,
      required: [true, 'requerid'],
      trim: true
    },
    blockchainSymbol: {
        type: String
    },
    status: {
        type: Boolean,
        default: true
    }
});

cryptoCurrencySchema.plugin(uniqueValidator, { message: '{PATH} debe ser unico' })

cryptoCurrencySchema.methods.toJSON = function() {

    let cryptoCurrency = this;
    let cryptoCurrencyObject = cryptoCurrency.toObject();
    delete cryptoCurrencyObject.__v;

    return cryptoCurrencyObject;

}

module.exports = mongoose.model('cryptoCurrency', cryptoCurrencySchema);