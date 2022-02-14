const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let emailErrorsSchema = new Schema({

    user:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "usuario"
    }],
    error: {
        type: String
    },
    status: {
        type: Boolean,
        default: true
    },
    fecha: {
      type: Date
    },
    email: {
      type: String
    },
    subject: {
      type: String
    },
    body: {
      type: String
    }
});

emailErrorsSchema.methods.toJSON = function() {

    let emailErrors = this;
    let emailErrorsObject = emailErrors.toObject();
    delete emailErrorsObject.__v;

    return emailErrorsObject;

}

module.exports = mongoose.model('email_errors', emailErrorsSchema);