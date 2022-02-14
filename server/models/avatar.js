const mongoose = require('mongoose');

let Schema = mongoose.Schema;
let avatarSchema = new Schema({

    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user_account"
    },
    logo: {
        type: String
    },
    photourl: {
        type: String
    },
	registrationDate:{
        type: Date
    },
    status: {
        type: Boolean,
        default: true
    }
});

avatarSchema.methods.toJSON = function() {

    let avatarUser = this;
    let avatarUserObject = avatarUser.toObject();
    delete avatarUserObject.__v;

    return avatarUserObject;
}
module.exports = mongoose.model('avatar_user', avatarSchema);