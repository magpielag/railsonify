const express = require('express');
const app = express();
const fetch = require('node-fetch');
const path = require('path');
const bp = require('body-parser');
const fs = require('fs');
const api = require(path.join(__dirname, 'data/api'));
const dbtools = require(path.join(__dirname, 'db/mongotools'));
const sttools = require(path.join(__dirname, 'tools/js/matching'));
const cantools = require(path.join(__dirname, 'tools/js/canvas'));
const mongurl = 'mongodb://localhost/raildata'

var database = dbtools.init(mongurl);

const apiIn = fs.readFileSync(path.join(__dirname, '../..', 'api-keys/transportapi.json'));
const apiJson = JSON.parse(apiIn);

var station = {key: '', location: {}, timetable: [] };

app.use(express.static(path.join(__dirname, '/public')));
app.use('/public/js', express.static(path.join(__dirname, '/public/js')));
app.use('/public/img', express.static(path.join(__dirname, '/public/img')));
app.use(bp.urlencoded({ extended: false }))

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/html/app.html'))
  cantools.build();
  console.log(cantools.boundaries);
});

app.post('/', function(req, res){
  
  let stationInput = req.body.station;
  let stationCode = sttools.match(stationInput);
  dbtools.store(database, stationCode, apiJson.id, apiJson.key, 'add');
  station.key = stationCode;
  station.location = sttools.find(stationCode);
  let updateTimetables = setInterval(function() {
    dbtools.store(database, station.key, apiJson.id, apiJson.key, 'update');
  }, 300000); // Every 5 minutes, remove the current mondo database collection and store a new frame of data.

});

app.post('/canvas', function(req, res) {

});

app.listen(process.env.PORT || 5000) // Listen on the environment port or on lh:5000.

// Draw with: https://bl.ocks.org/mbostock/885fffe88d72b2a25c090e0bbbef382f
// Pipe to html with: https://wesbos.com/html5-canvas-websockets-nodejs
// -> https://changelog.com/posts/node-canvas-render-and-stream-html5-canvas-using-node-js
// some working d3 examples: https://codepen.io/andybarefoot/pen/oBQKOb,
// ...
