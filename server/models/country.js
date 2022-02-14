const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

let Schema = mongoose.Schema;

let countrySchema = new Schema({
    name: {
        type: String,        
        lowercase: true, 
        unique: true,
        required: [true, 'required'],
        trim: true
    },
    code: {
        type: String,        
        lowercase: true, 
        trim: true
    },
    status: {
        type: Boolean,
        default: true
    }
});

countrySchema.plugin(uniqueValidator, { message: '{PATH} should be unique' })

countrySchema.methods.toJSON = function() {

    let country = this;
    let countryObject = country.toObject();    
    delete countryObject.__v;
    return countryObject;
}

module.exports = mongoose.model('country', countrySchema);