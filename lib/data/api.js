const request = require('node-fetch')
      path = require('path')
      lookup = require('./lookup')
      timeTools = require('../support/time')
      baseURL = "http://transportapi.com/v3/uk";
var addTime = timeTools.addTime
    lowestDuration = timeTools.lowestDuration;

const api = require(path.join(__dirname, '..', '..', '..', 'api-keys', 'transportapi.json'));

async function getTimetableData(database, stationCRS) {
  url = buildAPIAddress('timetable', stationCRS);
  await request(url) // Async request to TransportAPI url.
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
          toWrite[departureTime].time = null;
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
    var insertData = {station: stationCRS, timetable: toWrite};
    database.insert(insertData, function(err, newDoc) {}); // Write the data to the database.
  })
  .catch((error) => console.error(error));
}

async function getRouteLocation(database, departureCRS, arrivalCRS) {
// Format of stored information should be in an object containing the arrival and departure CRS in an array.
// This approach works but is subject to some problems as discussed in: https://stackoverflow.com/questions/10173956/how-to-use-array-as-key-in-javascript
// Instead of using ["a", "b"], the strings are concecated using a dividing comma - e.g. ["SHR, NWT"], since JS does this to string arrays anyways.
/*
  Final format: {
    "NWT, SHR": {
      "route": [[1, 2] [2, 3] [4, 5] ...]
    }
  }
*/

  url = buildAPIAddress('location', departureCRS, arrivalCRS);
  await request(url)
  .then((response) => response.json())
  .then(function(responseData) {
    var durations = [];
    var routeData = responseData.routes;
    for (i=0; i<routeData.length; i++) { // Iter through all durations.
      durations.push(routeData[i].duration);
    }
    var duration = lowestDuration(durations); // Find lowest duration time (to find shortest rail route between two stations).
    return routeData[duration];
  })
  .then(function(data) {
    var routeParts = data.route_parts;
    var toWrite = {};

    for (i=0; i<routeParts.length; i++) { // Iter through journey 'legs' and omit all those not using a train.
      if (routeParts[i].mode === 'train') {
        toWrite['station'] = departureCRS + '/' + arrivalCRS;
        toWrite['route'] = routeParts[i].coordinates;
      }
    }
    database.insert(toWrite, function(err, doc) {});
    }).catch((error) => console.error(error));
    return database;
}

function buildAPIAddress(action, stationCRS, targetCRS=null, endTime=null) {
  // Pieces together input variables and returns the associated TransportAPI url.
  switch(action) {
    case 'location':
    case 'coords':
    case 'loc':
      if (targetCRS != null) {
      depLoc = lookup.location(stationCRS);
      arrLoc = lookup.location(targetCRS);

      // Eventually add a check to see if the target station or departure station belongs to a TFL line, will need to use service=tfl.
      url = path.join(baseURL, 'public', 'journey', 'from', 'lonlat:' +
                      depLoc.lon + ',' + depLoc.lat, 'to', 'lonlat:' +
                      arrLoc.lon + ',' + arrLoc.lat + '.json?app_id=' +
                      api.id + '&app_key=' + api.key + '&service=southeast');
      return new URL(url);

      } else {
        console.error('Station-to-station path lookups require a departure and arrival station: An arrival station code was not entered.')
      }
      break;

    case 'timetable':
    case 'times':
    case 'time':
      if (endTime != null) {
        url = path.join(baseURL, 'train', 'station', stationCRS,
                        'live.json?app_id=' + api.id + '&app_key=' + api.key
                        + '&darwin=true&' + '&to_offset=PT' + endTime + 'train_status=passenger');
      } else {
        url = path.join(baseURL, 'train', 'station', stationCRS,
                        'live.json?app_id=' + api.id + '&app_key=' + api.key
                        + '&darwin=true&train_status=passenger');
      }
    return new URL(url);
    break;
  }
}


// Write function to grab timetable data, store in db file, then grab the route data of each due-to-depart train (not CANCELLED) and store under 'route'.
// Function to draw will then be GET -> pull from db -> function to loop through route key and draw into canvas.

module.exports = {
  writeTimetable: getTimetableData,
  writeRoute: getRouteLocation
}
