const modules = {
  convert: require('./convert.js')
}
var path = require('path')
let uppercase = modules.convert.makeUpper;
var fs = require('fs')
const stationCodes = fs.readFileSync(path.join(__dirname, '..', "json/stations.json"));
const stationCodesJSON = JSON.parse(stationCodes).locations;

function matchInput(station) {
  for (stations in stationCodesJSON) {
    if (stationCodesJSON[stations].name.includes(station)) {
      return stationCodesJSON[stations].crs;
    }
  }
}

function findPosition(station) {
  if (station.length <= 3) {
    for (stations in stationCodesJSON) {
      if (stationCodesJSON[stations].crs === station) {
        return { lat: stationCodesJSON[stations].lat,
           lon: stationCodesJSON[stations].lon
         }
      }
    }
  } else {
    station = makeUpper(station);
    for (stations in stationCodesJSON) {
      if (stationCodesJSON[stations].name === station) {
        return { lat: stationCodesJSON[stations].lat,
           lon: stationCodesJSON[stations].lon
         }
      }
    }
  }
}

module.exports = {
  find: findPosition,
  match: function(stationInput) { return matchInput(stationInput); }
};
