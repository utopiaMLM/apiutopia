const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let userCodeSchema = new Schema({
    user:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user_account"
      }],
      codeGenerated: {
        type: Number,
        required: [true, 'required']        
    },
    creationDate:{
        type: Date,
        default: new Date()
    },
    status: {
        type: Boolean,
        default: false
    }
});

userCodeSchema.methods.toJSON = function() {
    let userCode = this;
    let userObject = userCode.toObject();    
    return userObject;
}

module.exports = mongoose.model('user_code', userCodeSchema);