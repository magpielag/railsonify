const express = require('express')
      fs = require('fs')
      path = require('path')
      // Load node modules.
      server = express();
      // Initalise server.

var nedb = require('nedb') // Database library - based on Mongo.
    tools = {}
    tools.api = require(path.join(__dirname, 'data', 'api'))
    tools.lookup = require(path.join(__dirname, 'data', 'lookup'));
    // Load tools object containing all helper functions.

var database;
var routes;
var station;

server.use(express.static(path.join(__dirname, 'public')));
server.use('/public/js', express.static(path.join(__dirname, 'public', 'js')));
server.use('/public/img', express.static(path.join(__dirname, 'public', 'img')));
server.use(express.json({limit: '50mb'}));
server.use(express.urlencoded({limit: '50mb', extended: true, parameterLimit:50000}));

// Set server settings (public/static areas, parsing type, etc).

server.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'public', 'html', 'app.html'))
  database = new nedb({ filename: path.join(__dirname, 'store', 'db', 'timetable.db'), autoload:true });
  routes = new nedb({ filename: path.join(__dirname, 'store', 'db', 'route.db'), autoload:true })
});

server.post('/draw', async function(req, res) {
  try {
    console.log(`Body is:`);
    console.log(req.body);
    // Grab route coordinate array for given station, return the scaled coordinate array.
    var locationObj = req.body; // Object containing departure (.depart) and destination (.arrive) crs codes.
    var stationCodes = {depart: tools.lookup.crs(locationObj.depart), arrive: tools.lookup.crs(locationObj.arrive)};
    if (stationCodes.depart == stationCodes.arrive) {
      console.log('Skipping non-route')
      res.status(500).send('Non-route found');
      return;
    }
    routes.find({station: `${stationCodes.depart}/${stationCodes.arrive}`},
      async function(err, docs) {
        if (docs.length == 0) {
          routes = await tools.api.writeRoute(routes, stationCodes.depart, stationCodes.arrive);
          routes.find({station: `${stationCodes.depart}/${stationCodes.arrive}`},
                function(err, docs) {
                  if (!err) {
                  console.log('Sending docs...');
                  console.log(docs);
                  res.send(docs);
                  return;
                } else {
                  res.status(500).send('Error during route finding!');
                }
            });
        } else {
          console.log('Found docs in db, sending!');
          console.log(docs);
          res.send(docs);
          return;
        }
    });
  } catch(error) {
    console.error(error);
  }
});

server.post('/', function(req, res) { // On post request, default action is to store timetable of entered station string.
  // Potentially add checks for body integrity here?
  station = {};
  station.crs = tools.lookup.crs(req.body.station);
  station.location = tools.lookup.location(station.crs);
  tools.api.writeTimetable(database, station.crs).then(function() {
    database.find({station: station.crs}, function(err, docs){
      res.send(docs);
    })
  }).catch((err) => console.error(err))
});

server.listen(process.env.PORT || 5000) // Listen on the environment port or on lh:5000.


/*  Old Code:

const express = require('express')
      app = express()
      path = require('path')
      fs = require('fs')
      api = require(path.join(__dirname, 'data/api')
      dbTools = require(path.join(__dirname, 'data/mongotools'))
      searchTools = require(path.join(__dirname, 'data/lookup'))
      mongurl = 'mongodb://localhost/raildata'
      apiIn = fs.readFileSync(path.join(__dirname, '../..', 'api-keys/transportapi.json'));
      apiJson = JSON.parse(apiIn);

var database = dbTools.init(mongurl)
    station = {crs: '', location: {}, timetable: [] };

app.use(express.static(path.join(__dirname, '/public')));
app.use('/public/js', express.static(path.join(__dirname, '/public/js')));
app.use('/public/img', express.static(path.join(__dirname, '/public/img')));
app.use(express.urlencoded({ extended: false }));

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/html/app.html'))
  cantools.build();
  console.log(cantools.boundaries);
});

app.post('/', function(req, res){
  // Grab and store station variables (three char station code and location of station in lon/lat).
  let station.crs = lookup.crs(req.body.station);
  let station.location = lookup.location(stationCode);

  dbTools.store(database, stationCode, apiJson.id, apiJson.key, 'add');
  station.key = stationCode;
  station.location = sttools.find(stationCode);
  let updateTimetables = setInterval(function() {
    dbTools.store(database, station.key, apiJson.id, apiJson.key, 'update');
  }, 300000); // Every 5 minutes, remove the current mondo database collection and store a new frame of data.
  //res.send(JSON.stringify({stationCode: stationLocation});
});

app.post('/canvas', function(req, res) {

});

app.listen(process.env.PORT || 5000) // Listen on the environment port or on lh:5000.

// Draw with: https://bl.ocks.org/mbostock/885fffe88d72b2a25c090e0bbbef382f
// Pipe to html with: https://wesbos.com/html5-canvas-websockets-nodejs
// -> https://changelog.com/posts/node-canvas-render-and-stream-html5-canvas-using-node-js
// some working d3 examples: https://codepen.io/andybarefoot/pen/oBQKOb,
// ...
*/
