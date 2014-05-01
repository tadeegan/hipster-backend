var express = require('express');
var connect = require('connect');
var _ = require('underscore');
var async = require('async');

var lastfm = require("./lastfm");

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/hipster');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
    console.log("mongo open");
});


var artist_model = require('./artist_model');

var app = express();
app.use(connect.bodyParser());
app.get('/', function(req, res){
    res.send("hello tim");
});

app.get('/requestartists', function(req, res){
    var number = parseInt(req.param('limit'));
  artist_model.find().sort('sum').limit(number || 10).exec(
    function(err, artists){
        console.log("got here");
        res.json(artists);
    })
});
function get_artist_object(artist_id, callback){
    artist_model.findOne({"artist_id": artist_id}).exec(function(err, artist_obj){
            if(!artist_obj){
                var new_artist_model = new artist_model({
                    artist_id: artist_id,
                    sum: 0,
                    hipster: 0,
                    nothipster: 0,
                    unknown: 0
                });
                new_artist_model.save(function(err){
                    console.log("error: " + err);
                    callback(null, new_artist_model);
                });
            }else{

                callback(null, artist_obj);
            }
        });
}
app.post('/rankartists', function(req, res){
    var artists = req.body.artists;
    async.map(artists, get_artist_object, function(error, results){        
        var no_null = _.filter(results, function(obj){return !(obj == null)});
        no_null.forEach(function(artist){
            try{
                artist.classify();
            }
            catch(e){

            }
        });
        res.send(no_null);
        try{
            lastfm.start_lastfm_query();//starts the lasfm poll
        }catch(e){

        }
    });
});

app.post("/rank", function(req, res){
    var artist_id = req.param('id');
    var ranking = req.param('classification');
    console.log(artist_id + " " + ranking);
    artist_model.findOne({"artist_id": artist_id}).exec(function(err, artist_obj){
        console.log("finished query");
        if(artist_obj != null){
            artist_obj.sum ++;
            if(ranking == "hipster"){
                artist_obj.hipster++;
            }else if(ranking == "nothipster"){
                artist_obj.nothipster++;
            }else if(ranking == "unknown"){
                artist_obj.unknown ++;
            }
            artist_obj.save();
            console.log("here");
            res.send("ok");
        }else{
            res.send("nothing matches");
        }
    });
});

app.listen(3000);