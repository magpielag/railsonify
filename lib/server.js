const express = require('express')
      fs = require('fs')
      path = require('path')
      // Load node modules.
      server = express();
      // Initalise server.

var nedb = require('nedb') // Database library - based on Mongo.
    tools = {}
    tools.db = require(path.join(__dirname, 'support', 'database'))
    tools.lookup = require(path.join(__dirname, 'data', 'lookup'));
    // Load tools object containing all helper functions.

var timetable;
var routes;
var updateInterval;
var station = {};

server.use(express.static(path.join(__dirname, 'public')));
server.use('/public/js', express.static(path.join(__dirname, 'public', 'js')));
server.use('/public/img', express.static(path.join(__dirname, 'public', 'img')));
server.use(express.json({limit: '50mb'}));
server.use(express.urlencoded({limit: '50mb', extended: true, parameterLimit:50000}));

// Set server settings (public/static areas, parsing type, etc).

server.get('/', async function(req, res) {
  res.sendFile(path.join(__dirname, 'public', 'html', 'app.html'))
  timetable = await tools.db.new('timetable');
  routes = await tools.db.new('location');
});

server.post('/', async function(req, res) {
  try {
    var _stationCode = {station: tools.lookup.crs(req.body.station)};
    timetable = await tools.db.grab(res, timetable, _stationCode);
  } catch(error) { console.error(error); }

  /*
    Set interval/scheduler to update the database every 10-20 minutes.
    Update function will remove all existing entries under a station code key
    if they are out of sync (with an input time), replacing the database with a
    new one containing updated information - this is probably horribly inefficient,
    but comes as a result of a badly formatted/multi-dimensional original db
    (i.e. everything under one key.)
  */
});

server.post('/draw', async function(req, res) {
  try {
    var crsObject = req.body;
    crsObject.departure = tools.lookup.crs(crsObject.departure),
    crsObject.arrival = tools.lookup.crs(crsObject.arrival);
    console.log(`Finding with:`, crsObject);
    if ( crsObject.departure == crsObject.arrival ) {
      res.status(500).send(`Skipping non-route for
        ${crsObject.departure} to ${crsObject.arrival}`);
    } else {
      routes = await tools.db.grab(res, routes, crsObject);
    }
  } catch(error) { console.error(error); }
});

server.post('/update', async function(req, res) {
  console.log('RECEIVED UPDATE REQUEST');
  var _stationCode = Object.keys(req.body)[0];
  console.log('DEBUG:', _stationCode);
  var _currentDate = new Date();
  var timeStr = [_currentDate.getHours().toString(), (_currentDate.getMinutes()).toString()];
  for ( timeIdx = 0; timeIdx < timeStr.length; timeIdx++ ) {
    if ( timeStr[timeIdx].length == 1 ) {
      timeStr[timeIdx] = `0${timeStr[timeIdx]}`;
    }
  }

  var _currentTime = `${timeStr[0]}:${timeStr[1]}`;
  timetable = await tools.db.update(timetable, _currentTime);
  tools.db.grab(res, timetable, {station: _stationCode });
});

server.listen(process.env.PORT || 5000) // Listen on the environment port or on lh:5000.
