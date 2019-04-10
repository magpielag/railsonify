const stationJSON = require('../tools/json/stations.json')
      stationRank = require('../tools/json/rankings.json');

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
        if ( crsList.includes(station) ) {
          for ( code in crsList ) {
            if ( crsList[code] === station ) {
              return crsList[code];
            }
          }
        }
      }
    }
    if ( stationString.length == 3 && Object.values(stationRank).includes(stationString) ) {
      return stationString;
    } else if ( stationString.includes(',') ) {
      stationString = stationString.split(', ')[1];
    }
    var allMatching = getMatching(stationString);
    if ( allMatching.length > 1 ) {
      return compFootfall(allMatching);
    } else {
      return allMatching[0];
    }
}

function locGet(locationStr) {
  console.log(`Station code is ${locationStr}`);
  function getLocCoords(stationCode) {
    // Given an input station code, find the location of the station.
    for (i=0; i<stationJSON.locations.length; i++) {
      if (stationJSON.locations[i].crs === stationCode) {
        console.log(stationJSON.locations[i]);
        return {lon: stationJSON.locations[i].lon , lat: stationJSON.locations[i].lat };
      }
    }
  }

  if (locationStr.length == 3) {
    if (Object.values(stationRank).includes(locationStr)) {
    return getLocCoords(locationStr);
    } else {
      console.error('The input CRS code (3-character station code) is not valid.')
    }
  } else {
    return locGet(crsGet(locationStr));
  }
}

function randSearch() {
  var ranks = Object.keys(stationRank);
  function makeInts() {
    var intList = [];
    for ( let r = 1; r < 4; r++ ) {
      intList.push(Math.floor(Math.random() * Math.round(ranks.length/(Math.pow(r, 3)))) + 1);
    }
    return intList;
  }
  var stations = [];
  makeInts().forEach(function(r) {
    stations.push(stationRank[r]);
  });
  var names = getName(stations);
  return [stations, names];
}

function getName(crsList) {
  console.log(crsList);
  var matches = [];
  stationJSON.locations.forEach(function(station) {
    if (crsList.includes(station.crs)) {
      crsList.forEach(function(crs){
        if (crs == station.crs) {
          matches.push(station.name);
          if ( matches.length == crsList.length ) return matches;
        }
      });
    }
  });
  return matches;
}

module.exports = {
  crs: crsGet,
  location: locGet,
  random: randSearch,
  name: getName
};
