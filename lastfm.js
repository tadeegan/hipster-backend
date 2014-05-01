var http = require("http");
var artist_model_class = require("./artist_model");
var queue = [];
module.exports.start_lastfm_query = function(){
    var min_lasfm_request_interval = 600; //actually 500 but to be safe..
    var timer = setInterval(function(){
        console.log("---------------------------------------");
        if(queue.length == 0){
            console.log("queue empty... done");
            clearInterval(timer);
            return;
        }
        var artist_model = queue.shift();
        console.log(artist_model.artist_id);
        var mbid_regex = /([a-f]|[0-9]|-){20,}/;
        var path = "";
        if(mbid_regex.test(artist_model.artist_id)){
            console.log("mbid: " + artist_model.artist_id);
            path = "/2.0/?method=artist.getinfo&mbid=" + artist_model.artist_id + "&api_key=bca21e8b3552830cf760f1b8083bc979&format=json";
        }
        else{
            console.log("name: " + artist_model.artist_id);
            path = "/2.0/?method=artist.getinfo&artist=" + artist_model.artist_id + "&api_key=bca21e8b3552830cf760f1b8083bc979&format=json";
        }
        console.log("ws.audioscrobbler.com/");
        getJSON({
            host: "ws.audioscrobbler.com",
            path: path,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }, 
        function(statusCode, result){
            console.log("Last.fm responded~~~~~~~~~~~~");
            console.log(result);
            console.log("status: " + statusCode);
            console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
            result = {
                name: result.artist.name,
                mbid: result.artist.mbid,
                bandmembers: result.artist.bandmembers,
                url: result.artist.url,
                stats: result.artist.stats,
                tags: result.artist.tags
            }
            artist_model_class.findOne({artist_id: artist_model.artist_id}, function (err, doc){
                console.log(doc);

                doc.lastfmdata = result;
                doc.save(function(err){
                    console.log("saved....");
                    if(err) console.log(err);
                });
            });
        });
    }, min_lasfm_request_interval);
}


module.exports.queue = function(artist_model){
    console.log("queing artist :" + artist_model.artist_id);
    queue.push(artist_model);
}

var getJSON = function(options, onResult)
{
    console.log("getting json");
    var req = http.request(options, function(res)
    {
        var output = '';
        res.setEncoding('utf8');

        res.on('data', function (chunk) {
            output += chunk;
        });

        res.on('end', function() {
            var obj = JSON.parse(output);
            onResult(res.statusCode, obj);
        });
    });

    req.on('error', function(err) {
        //res.send('error: ' + err.message);
    });

    req.end();
};