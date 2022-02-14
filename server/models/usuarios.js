const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const CONST = require("../commons/constants");

let Schema = mongoose.Schema;

let usuarioSchema = new Schema({
    name: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'required'],
        lowercase: true, 
        trim: true
    },
    password: {
        type: String,        
    },
    rifRuc: {
        type: String    
    },
    logo: {
        type: String
    },  
    creationDate:{
        type: Date,
        default: new Date()
    },
    modificationDate:{
        type: Date
    },
    phonehome: {
        type: String,
    },    
    phonecel: {
        type: String,
    },    
    web: {
        type: String,
    }, 
    status: {
        type: Boolean,
        default: false
    }, 
    role:{
        type: String,
        default: CONST.ROLE.USER
    }
});

usuarioSchema.plugin(uniqueValidator, { message: '{PATH} should be unique' })

usuarioSchema.methods.toJSON = function() {

    let user = this;
    let userObject = user.toObject();
    delete userObject.password;    
    delete userObject.__v;
    return userObject;
}

module.exports = mongoose.model('user_account', usuarioSchema);