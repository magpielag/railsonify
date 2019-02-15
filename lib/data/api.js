const fetch = require('node-fetch')
      path = require('path')
      lookup = require('./lookup')
      dataStore = require('nedb')
      timeTools = require('../support/time')
      baseURL = 'https://transportapi.com/v3/uk/';
var addTime = timeTools.addTime
    lowestDuration = timeTools.lowestDuration;

function getTimetableData(apiObj, stationCRS) {
  url = buildAPIAddress('timetable', apiObj, stationCRS);
  fetch('https://transportapi.com/v3/uk/train/station/LDS/live.json?app_id=36ff295c&app_key=ce8c14bfd3aadbcf111080f60eeac3ac&darwin=true&to_offset=PT00:30:00&train_status=passenger')
  .then((response) => response.json())
  .then(function(responseData) {
    responseData = responseData.departures.all;
    database = new dataStore({ filename: path.join(__dirname, 'timetable.db'), autoload:true});
    return [database, responseData];
  }).then(function(arr) {
    var db = arr[0]
        departureData = arr[1]
        dbData = {};

    for (i=0; i<departureData.length; i++) {
      var data = departureData[i];
      var depTime = addTime(data.expected_departure_time, data.best_departure_estimate_mins);

      dbData[depTime] = {
        operator: data.operator,
        origin: data.origin_name,
        destination: data.destination_name,
        status: data.status }
      switch(dbData[depTime].status) {
        case 'CANCELLED':
          dbData[depTime].time = null;
          break;

        case 'ON TIME':
          dbData[depTime].time = {
            aimed: {
              arrival: data.aimed_arrival_time,
              departure: data.aimed_departure_time
            },
            expected: null
          };
          dbData[depTime].time.late = false;
          break;

        case 'STARTS HERE':
          dbData[depTime].time = {
            aimed: {
              arrival: null,
              departure: data.aimed_departure_time
            },
            expected: {
              arrival: null,
              departure: data.expected_departure_time
            }
          }
          break;

        case 'EARLY':
          dbData[depTime].time = {
            aimed: {
              arrival: data.aimed_arrival_time,
              departure: data.aimed_departure_time
            },
            expected: {
              arrival: addTime(data.expected_arrival_time, data.best_arrival_estimate_mins),
              departure: data.expected_departure_time
            }
          }
          break;

        case 'LATE':
          dbData[depTime].time = {
            aimed: {
              arrival: data.aimed_arrival_time,
              departure: data.aimed_departure_time
            },
            expected: {
              arrival: addTime(data.expected_arrival_time, data.best_arrival_estimate_mins),
              depart: addTime(data.expected_departure_time, data.best_departure_estimate_mins)
            }
          }

        case 'NO REPORT':
          break;
        // STARTS HERE, EARLY, LATE.
      }
    }

    db.insert(dbData, function(err, newDoc) {});
    })
}

function getRouteLocation(database, apiObj, departureCRS, arrivalCRS) {
  // Get fetch working.
  // Add to existing timetable database by looking up each location and appending to a new key 'route' for that train.
  url = buildAPIAddress('location', apiObj, departureCRS, arrivalCRS);
  fetch("https:/transportapi.com/v3/uk/public/journey/from/lonlat:-1.5480255300534769,53.79562496030203/to/lonlat:-3.3113916901658813,52.51231212088594.json?app_id=36ff295c&app_key=ce8c14bfd3aadbcf111080f60eeac3ac&service=southeast")
  .then((response) => response.json())
  .then(function(responseData) { // Filter out non train routes.
    var data = []
    responseData = responseData.routes.route_parts;
    for (i=0; i<responseData.length; i++) {
      if (responseData[i].mode === 'train') {
        data.push(responseData[i]);
      }
    }
    console.log(data);
    return data;
  }).then(function(data) {
      // Initalise database, format data and store.
    }).catch((error) => console.error(error));
}

function getRoute(database) {
  const jData = require('./oh.json');
  var newData = jData.routes;
  var data = {};
  var durations = [];

  for (i=0; i<newData.length; i++) {
    durations.push(newData[i].duration);
  }
  console.log(durations);
  tempData = newData[lowestDuration(durations)].route_parts;
  for (i=0; i<tempData.length; i++) {
     if (tempData[i].mode === 'train') {
      data[tempData[i].departure_time] = tempData[i].coordinates;
    }
  }
  database.insert(data);
}

console.log(getRoute());

function buildAPIAddress(action, apiObj, stationCRS, targetCRS=null, endTime=null) {
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
                      apiObj.id + '&app_key=' + apiObj.key + '&service=southeast');
      return url;
      } else {
        console.error('Station-to-station path lookups require a departure and arrival station: An arrival station code was not entered.')

      }
      break;

    case 'timetable':
    case 'times':
    case 'time':
      if (endTime != null) {
        url = path.join(baseURL, 'train', 'station', stationCRS,
                        'live.json?app_id=' + apiObj.id + '&app_key=' + apiObj.key
                        + '&darwin=true&' + '&to_offset=PT' + endTime + 'train_status=passenger');
      } else {
        url = path.join(baseURL, 'train', 'station', stationCRS,
                        'live.json?app_id=' + apiObj.id + '&app_key=' + apiObj.key
                        + '&darwin=true&train_status=passenger');
      }
    return url;
    break;
  }
}

var api = {id: '36ff295c', key: 'ce8c14bfd3aadbcf111080f60eeac3ac'};
getTimetableData(api, 'LDS');
//getRouteLocation(api, 'LDS', 'NWT');

// Write function to grab timetable data, store in db file, then grab the route data of each due-to-depart train (not CANCELLED) and store under 'route'.
// Function to draw will then be GET -> pull from db -> function to loop through route key and draw into canvas.

module.exports = {

}
