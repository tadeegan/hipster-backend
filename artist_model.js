var mongoose = require('mongoose');

var modelSchema = new mongoose.Schema({
    artist_id: {
        type: String,
        index: true
    },
    hipster: {
        type: Number
    },
    nothipster: {
        type: Number
    },
    unknown: {
        type: Number
    },
    sum: {
        type: Number
    }
});

var db_model = mongoose.model('artist', modelSchema);

module.exports = {
    model: db_model
};