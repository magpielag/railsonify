const request = require('node-fetch')
      path = require('path')
      lookup = require('./lookup')
      timeTools = require('../support/time')
      baseURL = "http://transportapi.com/v3/uk";
var addTime = timeTools.addTime
    lowestDuration = timeTools.lowestDuration;

const api = require(path.join(__dirname, '..', '..', '..', 'api-keys', 'transportapi.json'));

async function getTimetableData(database, stationCRS) {
  url = buildAPIAddress('timetable', stationCRS, endTime="00:05:00");
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
    var insertData = {station: stationCRS, timetable: toWrite};
    database.insert(insertData, function(err, newDoc) {}); // Write the data to the database.
  })
  .catch((error) => console.error(error));
}

async function routeGet(stations, service='southeast') {
/* DCrs/ACrs: { 1: { depart: crs, arrive: crs, coords: [] },
            2: { ... },
          ...
        }
*/

  const arrival = stations.arrival, departure = stations.departure
        url = buildAPIAddress('location', arrival, departure, railService=service);

  await request(url).then((response) => response.json())
  .then(function(data) {
    data = data.routes;

    var durationList = new Array(data.length);
    for (i = 0; i < data.length; i++) {
      // Store durations of each route.
      if ( data[i].duration != null) {
        durationList[i] = data[i].duration;
      } else {
        durationList.splice(1, i);
      }
    }
  return data[lowestDuration(durationList)].route_parts;

  }).then(function(routeArray) {
    var stationString = `${arrival}/${departure}`
        dataToWrite = {}
        modeIndex = 0
        dataToWrite[stationString] = {};

    for ( i = 0; i < routeArray.length; i++ ) {
      if ( routeArray[i].mode === 'train' | routeArray[i].mode === 'tube' ) {
        var arr = routeArray[i];
        // Even though a 'modes' var is used in the api url, foot journeys are still included...
        dataToWrite[stationString][modeIndex] = {
          departure: lookup.crs(arr.from_point_name),
          arrival: lookup.crs(arr.to_point_name),
          route: arr.coordinates
        }
        modeIndex += 1;
      }
    }
    console.log(dataToWrite);
    return dataToWrite;

  }).then(function(dataFinal) {
    if ( Object.values(Object.values(dataFinal)[0]) <= 0 ) {
      new Error('No routes found under southeast service');
    } else {
      return dataFinal;
    }
  }).catch((error) => {
    if ( error.toString().includes('southeast service') ) {
      return routeGet(stations, service = 'tfl');
    } else {
      console.error(error);
    }
  // Add additional error handling.
  });
}

function buildAPIAddress(action, stationCRS, targetCRS=null, endTime=null, service='southeast') {
  // Pieces together input variables and returns the associated TransportAPI url.
  switch(action) {
    case 'location':
    case 'coords':
    case 'loc':
      if (targetCRS != null) {
      depLoc = lookup.location(stationCRS);
      arrLoc = lookup.location(targetCRS);

      console.log(`Calling location for:  ${service} service`)
      if ( service === 'southeast' ) { var mode = 'train'
      } else { var mode = 'train-tube' }

      // Eventually add a check to see if the target station or departure station belongs to a TFL line, will need to use service=tfl.
      url = path.join(baseURL, 'public', 'journey', 'from', 'lonlat:' +
                      depLoc.lon + ',' + depLoc.lat, 'to', 'lonlat:' +
                      arrLoc.lon + ',' + arrLoc.lat + '.json?app_id=' +
                      api.id + '&app_key=' + api.key + '&modes=' + mode
                      + '&service=' + service);
      console.log(`Building with url: ${url}`);
      return new URL(url);

      } else {
        console.error('Station-to-station path lookups require a departure and arrival station: An arrival station code was not entered.')
      }
      break;

    case 'timetable':
    case 'times':
    case 'time':
      console.log(`EndTime is ${endTime} and is not null? ${endTime != null}`);
      if (endTime != null) {
        url = path.join(baseURL, 'train', 'station', stationCRS,
                        'live.json?app_id=' + api.id + '&app_key=' + api.key
                        + '&darwin=true&' + '&to_offset=PT' + endTime + 'train_status=passenger');
      } else {
        url = path.join(baseURL, 'train', 'station', stationCRS,
                        'live.json?app_id=' + api.id + '&app_key=' + api.key
                        + '&darwin=true&train_status=passenger');
      }
    console.log(`Building with url: ${url}`);
    return new URL(url);
    break;
  }
}

// Write function to grab timetable data, store in db file, then grab the route data of each due-to-depart train (not CANCELLED) and store under 'route'.
// Function to draw will then be GET -> pull from db -> function to loop through route key and draw into canvas.


//routeGet(stations={departure:'NWT', arrival:'SHR'});

module.exports = {
  writeTimetable: getTimetableData,
  writeRoute: routeGet
}
