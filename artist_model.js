var mongoose = require('mongoose');
var lastfm = require("./lastfm");
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
    },
    tags: {
        type: Array
    },
    classification: {
        type: String,
        default: "n/a"
    },
    lastfmdata: {
        type: Object,
        default: null
    }
});

var db_model = mongoose.model('artist', modelSchema);

db_model.prototype.classify = function(){
    var percent_hipster = this.hipster / this.sum;
    var percent_mainstream = this.nothipster / this.sum;
    var percent_unkown = 1 - percent_hipster - percent_mainstream;

    //number of votes is less than 3 then voting isnt reliable
    if(this.sum > 3){
        if((percent_hipster > .5 || (percent_hipster + percent_unkown) > .65) && percent_mainstream < .2){
            this.classification = "hipster";
        }
        else if((percent_mainstream > .40)){
            this.classification = "mainstream";
        }
        else{
            this.classification = "neither";
        }
    }
    else{
        if(this.lastfmdata) {
            console.log("has data");
            if(this.lastfmdata.stats.playcount > 10000000) this.classification = "mainstream";
            else if(this.lastfmdata.stats.playcount > 100000) this.classification = "neither";
            else{
                this.classification = "hipster"
            }
        }
        else{
            this.queue_for_lastfm_query();
            var random = Math.random();
            if(random < .2){
                this.classification = "hipster";
            }else if(random < .5){
                this.classification = "neither";
            }else{
                this.classification = "mainstream"
            }
        }
    }
    this.save();

}

db_model.prototype.queue_for_lastfm_query = function(){
    lastfm.queue(this);
}

module.exports = db_model;