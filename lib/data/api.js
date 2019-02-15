const fetch = require('node-fetch')
      path = require('path')
      lookup = require('./lookup')
      dataStore = require('nedb')
      addTime = require('../support/time').addTime;
      baseURL = 'https://transportapi.com/v3/uk/';

function getTimetableData(apiObj, stationCRS) {
  url = buildAPIAddress('timetable', apiObj, stationCRS);
  fetch('https://transportapi.com/v3/uk/train/station/LDS/live.json?app_id=36ff295c&app_key=ce8c14bfd3aadbcf111080f60eeac3ac&darwin=true&to_offset=PT00:10:00&train_status=passenger')
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
      dbData[i] = {
        operator: data.operator,
        origin: data.origin_name,
        destination: data.destination_name,
        status: data.status }
      switch(dbData[i].status) {
        case 'CANCELLED':
          dbData[i].time = null;
          break;

        case 'ON TIME':
          dbData[i].time = {
            aimed: {
              arrival: data.aimed_arrival_time,
              departure: data.aimed_departure_time
            },
            expected: null
          };
          dbData[i].time.late = false;
          break;

        case 'STARTS HERE':
          dbData[i].time = {
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
          dbData[i].time = {
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
          dbData[i].time = {
            aimed: {
              arrival: data.aimed_arrival_time,
              departure: data.aimed_departure_time
            },
            expected: {
              arrival: addTime(data.expected_arrival_time, data.best_arrival_estimate_mins),
              depart: addTime(data.expected_departure_time, data.best_departure_estimate_mins)
            }
          }
          console.log(dbData[i]);

        case 'NO REPORT':
          break;
        // STARTS HERE, EARLY, LATE.
      }
    }


    db.insert(dbData, function(err, newDoc) {});
    })
}

function buildAPIAddress(action, apiObj, stationCRS, targetCRS=null, endTime=null) {
  // Pieces together input variables and returns the associated TransportAPI url.
  switch(action) {
    case 'location':
    case 'coords':
    case 'loc':
      if (targetCRS != null) {
      depLoc = lookup.location(stationCRS);
      arrLoc = lookup.location(targetCRS);
      console.log(location.lon, location.lat);
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

/*function drawLocation(canvas, colour, apiUrl, fromStation, toStation) {
  // Using station codes in 'station' variables [e.g. 'ABC', 'LDS'].
  // Unsure if we want to build the url in this function or not.
  fetch(apiUrl)
  .then((response)=>response.json()) // Convert response to json data.
  .then(function(data) {
    const stationCoords = data.routes.route_parts
          locationCoordinates;
    for (i = 0; i < stationCoords.length; i++) {
      if (stationCoords[i].mode === "train") {
      locationCoordinates.push(stationCoords[i].coordinates);
      }
    }
    return locationCoordinates;
    //const locationCoordinates = data.routes.route_parts.coordinates;
  }).then((coordinates) => canvasTools.drawRoute(canvas, coordinates, '#FFC0CB')) // Colour is set.
  .catch(error, function(error) { console.error(error); });
}*/

module.exports = {

}
