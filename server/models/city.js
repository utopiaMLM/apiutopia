const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let citySchema = new Schema({

    country:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "country"
    }],
    name: {
        type: String,        
        lowercase: true,
        required: [true, 'required'],
        trim: true
    },
    status: {
        type: Boolean,
        default: true
    }
});

citySchema.methods.toJSON = function() {

    let city = this;
    let cityObject = city.toObject();
    delete cityObject.__v;

    return cityObject;

}

module.exports = mongoose.model('city', citySchema);