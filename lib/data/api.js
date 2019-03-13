const request = require('node-fetch')
      path = require('path')
      lookup = require('./lookup')
      timeTools = require('../support/time')
      baseURL = "http://transportapi.com/v3/uk";
var addTime = timeTools.addTime
    minConvert = timeTools.minuteConvert
    lowestDuration = timeTools.lowestDuration;
//const api = require(path.join(__dirname, '..', '..', '..', 'api-keys', 'transportapi.json'));
const api = require(path.join(__dirname, '..', '..', '..', '..','api-keys', 'transportapi.json'));
console.log(api);

var apiIdx;
var apiObj = { id: null, key: null };

function switchKey() {
  if ( apiIdx == null ) { apiIdx = 0; }
  try {
  apiObj.id = api.accounts[apiIdx].id;
  apiObj.key = api.accounts[apiIdx].key;
  if ( apiObj.id == null | apiObj.key == null ) {
    throw "Out of keys!"
  }
  apiIdx++;
  }
  catch(error) {
    if ( error.toString().includes('keys') ) {
      return undefined;
    }
  }
}

async function getTimetableData(database, stationCRS) {
  url = buildAPIAddress('timetable', stationCRS, endTime="00:05:00");
  return await request(url) // Async request to TransportAPI url.
  //.then(function(response) { console.log(`hello: ${response.json()}`); return response; })
  .then((response) => response.json()) // Parse response as JSON.
  .then((responseJSON) => responseJSON.departures.all) // Cut out the unneeded gunk.
  .then(function(data) { // Store each individual departure notice, with times and status in database.
    var toWrite = {}; // Empty object to serve as JSON shell.
    for (i=0; i<data.length; i++) {
      var field = data[i]; // Store a copy of the current data (as to not continuously call for it over and over).
      if (field.status != 'CANCELLED') {
      var departureTime = addTime(field.expected_departure_time, field.best_departure_estimate_mins); // Using depature time as a key...
    } else {
      var departureTime = field.aimed_arrival_time;
    }
      // Store values in the object relating to operator name, origin station, final destination, current status, and timing depending on status.
      toWrite[departureTime] = {
        operator: field.operator,
        origin: field.origin_name,
        destination: field.destination_name,
        status: field.status }
      switch(toWrite[departureTime].status) {
        case 'CANCELLED':
          toWrite[departureTime].time = departureTime;
          break;

        case 'ON TIME':
          toWrite[departureTime].time = {
            aimed: {
              arrival: field.aimed_arrival_time,
              departure: field.aimed_departure_time
            },
            expected: null
          };
          toWrite[departureTime].time.late = false;
          break;

        case 'STARTS HERE':
          toWrite[departureTime].time = {
            aimed: {
              arrival: null,
              departure: field.aimed_departure_time
            },
            expected: {
              arrival: null,
              departure: field.expected_departure_time
            }
          }
          break;

        case 'EARLY':
          toWrite[departureTime].time = {
            aimed: {
              arrival: field.aimed_arrival_time,
              departure: field.aimed_departure_time
            },
            expected: {
              arrival: addTime(field.expected_arrival_time, field.best_arrival_estimate_mins),
              departure: field.expected_departure_time
            }
          }
          break;

        case 'LATE':
          toWrite[departureTime].time = {
            aimed: {
              arrival: field.aimed_arrival_time,
              departure: field.aimed_departure_time
            },
            expected: {
              arrival: addTime(field.expected_arrival_time, field.best_arrival_estimate_mins),
              depart: addTime(field.expected_departure_time, field.best_departure_estimate_mins)
            }
          }

        case 'NO REPORT':
          break;
        // STARTS HERE, EARLY, LATE.
      }
    }
    var dataToWrite = {}
        dataToWrite[stationCRS] = toWrite;
    return dataToWrite;
    //database.insert(dataToWrite, function(err, newDoc) {}); // Write the data to the database.
  })
  .catch((error) => console.error(error));
}

async function routeGet(stations, service='southeast') {
/* DCrs/ACrs: { 1: { depart: crs, arrive: crs, coords: [] },
            2: { ... },
          ...
        }
*/

  const arrival = stations.arrival, departure = stations.departure;
  console.log(`SERVICE IS: ${service}`)
  var url = buildAPIAddress('location', departure, arrival, null, service);
  // TODO: Current problem: routes are being searches as from X to X (same location), check location lookup.
  return await request(url).then((response) => response.json())
  .then(function(data) {
    // Iterate through routes and find all those with train links:
    // Routes: route_parts: mode.

    if (!data.error) { data = data.routes;
    } else { throw "Cannot reach server"; }

    var journeyList = [];
    /* Investigate each route ( journey ) available between the two stations:
      Inside each array is a 'route_parts' array containing the coordinates
      (path), duration, and mode of transit between each stop in the journey. */
    data.forEach(function(e) {
      var duration = e.duration; // Get this journey's duration.
      var routeParts = e.route_parts; // Get this journey's route parts (links between each stop)
      var trainRoutes = [];
      /* Investigate each route_parts array: If the mode is a train or tube,
         we want to plot it, so append it to a  new list containing only the train routes. */
      routeParts.forEach(function(en) {
        if ( en.mode === 'train' | en.mode === 'tube' ) {
          trainRoutes.push(en); // Write all train or tube routes in this journey to a list.
        }
      });
      // Append to the journey list the current journey and its duration
        // only if there is a train journey found.
      if ( trainRoutes.length > 0 ) { journeyList.push([duration, trainRoutes]); }
    });

    if ( journeyList.length > 0 ) {
      if ( journeyList.length > 1 ) {

        // Find shortest duration journey and return it's routes.
        var durations = [];
        journeyList.forEach(function(e) { durations.push(e[0]); });
        return journeyList[lowestDuration(durations)][1];

      } else {
        return journeyList[0][1]; // Pipe train routes to the next func.
      }
    } else { // No journeys found using current inputs, try 'tfl' before failing.
      if ( service === 'tfl' ) { throw "No routes found under tfl service";
      } else { throw "No routes found under southeast service"; }
    }

  }).then(function(routeArray) {
    /* Input is an array of route_parts for the lowest duration journey between
       the two specified points. Returns an object with a string key equalling
       the two input stations [depature/arrival].
       */

    var objToReturn = {}
        modeIdx = 0
        keyString = `${departure}/${arrival}`
        objToReturn[keyString] = {};

    routeArray.forEach(function(e) {
      // e is a list containing all the the route_part for one leg of the journey.
      objToReturn[keyString][modeIdx] = {
        departure: lookup.crs(e.from_point_name),
        arrival: lookup.crs(e.to_point_name),
        route: e.coordinates,
        duration: minConvert(e.duration)
      };
      modeIdx++; // Store all the information in an obj, then incriment the idx.
    });
    // E.G. SHR/NWT: { 0: { d: "SHR", a: "NWT", r: [[0, 1], ...], d: 38 }, ... }
    return objToReturn;

  }).then(function(dataFinal) {
    if ( Object.values(Object.values(dataFinal)[0]) <= 0 ) {
      new Error('No routes found under southeast service');
    } else {
      return dataFinal;
    }
  }).catch((error) => {
    if ( error.toString().includes('southeast service') ) {
      console.log("Trying tfl...")
      return routeGet(stations, 'tfl');
    } else if ( error.toString().includes('server') ) {
      var confirmation = switchKey();
      if (confirmation) { return routeGet(stations, service); }
    } else {
      console.error(error);
      return { error: error };
    }
  // Add additional error handling.
  });
}

function buildAPIAddress(action, stationCRS, targetCRS=null, endTime=null, searchService) {
  if ( apiObj.id == null | apiObj.key == null ) { switchKey(); }

  // Pieces together input variables and returns the associated TransportAPI url.
  switch(action) {
    case 'location':
    case 'coords':
    case 'loc':
      if (targetCRS != null) {
        // Find latlon of current and target station.
        depLoc = lookup.location(stationCRS);
        arrLoc = lookup.location(targetCRS);

        if ( searchService === 'southeast' ) {
          var mode = 'train'
        } else if ( searchService === "tfl" ) {
          var mode = 'train-tube'
        } else {
          console.error('No service entered, defaulting to southeastern');
          var searchService = 'southeast', mode = 'train';
        }
      } else {
        console.error('No target station confirmed, please enter a target station.');
        return null;
        break;
      }

      url = path.join(baseURL, 'public', 'journey', 'from', 'lonlat:' +
                      depLoc.lon + ',' + depLoc.lat, 'to', 'lonlat:' +
                      arrLoc.lon + ',' + arrLoc.lat + '.json?app_id=' +
                      apiObj.id + '&app_key=' + apiObj.key + '&modes=' + mode
                      + '&service=' + searchService);
      console.log(`Building with url: ${url}`);
      return new URL(url);
      break;

    case 'timetable':
    case 'times':
    case 'time':
      console.log(`EndTime is ${endTime} and is not null? ${endTime != null}`);
      if (endTime != null) {
        url = path.join(baseURL, 'train', 'station', stationCRS,
                        'live.json?app_id=' + apiObj.id + '&app_key=' + apiObj.key
                        + '&darwin=true&' + '&to_offset=PT' + endTime + 'train_status=passenger');
      } else {
        url = path.join(baseURL, 'train', 'station', stationCRS,
                        'live.json?app_id=' + apiObj.id + '&app_key=' + apiObj.key
                        + '&darwin=true&train_status=passenger');
      }
    console.log(`Building with url: ${url}`);
    return new URL(url);
    break;
  }
}

// Write function to grab timetable data, store in db file, then grab the route data of each due-to-depart train (not CANCELLED) and store under 'route'.
// Function to draw will then be GET -> pull from db -> function to loop through route key and draw into canvas.


module.exports = {
  writeTimetable: getTimetableData,
  writeRoute: routeGet
}
