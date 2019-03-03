const stationJSON = require('../tools/json/stations.json')
      stationRank = require('../tools/json/rankings.json')
      fs = require('fs')
      path = require('path');

function crsGet(stationString) {
    function getMatching(stationName) {
      var results = [];
      for ( i = 0; i < stationJSON.locations.length; i++ ) {
        var compString = stationJSON.locations[i].name;
        if ( compString.includes(stationName) ) {
          results.push(stationJSON.locations[i].crs);
        }
      }
      return results;
    }

    function compFootfall(crsList) {
      const keys = Object.keys(stationRank);
      for (i=0; i<keys.length; i++) {
        // Check codes against key of value.
        // If match, check which input value matches, then return it.
        var station = stationRank[keys[i]];
        if ( crsList.includes(rank) ) {
          for ( code in crsList ) {
            if ( crsList[code] === station ) {
              return crsList[code];
            }
          }
        }
      }
    }

    var allMatching = getMatching(stationString);
    if ( allMatching.length > 1 ) {
      return compFootfall(allMatching);
    } else {
      return allMatching[0];
    }
}

function getLocCoords(stationCode) {
  // Given an input station code, find the location of the station.
  for (i=0; i<stationJSON.locations.length; i++) {
    if (stationJSON.locations[i].crs === stationCode) {
      return {lon: stationJSON.locations[i].lon , lat: stationJSON.locations[i].lat };
    }
  }
}

function findLocation(locationStr) {
  if (locationStr.length == 3) {
    if (Object.values(stationRank).includes(locationStr)) {
    return getLocCoords(locationStr);
    } else {
      console.error('The input CRS code (3-character station code) is not valid.')
    }
  } else {
    return findLocation(findCRS(locationStr));
  }
}

// Add exports.
module.exports = {
  crs: crsGet,
  location: findLocation
};
