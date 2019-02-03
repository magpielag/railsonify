const express = require('express');
const app = express();
const fetch = require('node-fetch');
const path = require('path');
const bp = require('body-parser');
const fs = require('fs');
const dbtools = require(path.join(__dirname, 'db/mongotools'));
const sttools = require(path.join(__dirname, 'tools/js/matching'));
const mongurl = 'mongodb://localhost/raildata'

var database = dbtools.init(mongurl);

const apiIn = fs.readFileSync(path.join(__dirname, '../..', 'api-keys/transportapi.json'));
const apiJson = JSON.parse(apiIn);

var station = {key: '', location: {}, timetable: [] };

app.use(express.static(path.join(__dirname, '/public')));
app.use(bp.urlencoded({ extended: false }))

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/html/app.html'))
});

app.post('/', function(req, res){
  let stationInput = req.body.station;
  let stationCode = sttools.match(stationInput);
  dbtools.store(database, stationCode, apiJson.id, apiJson.key, 'add');
});

app.listen(process.env.PORT || 5000) // Listen on the environment port or on lh:5000.

setTimeout(function() { dbtools.store(database, 'LDS', apiJson.id, apiJson.key, 'update')}, 13000)
