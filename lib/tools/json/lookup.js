const stationJSON = require('./stations.json')
      stationRank = require('./rankings.json')
      fs = require('fs')
      path = require('path');

function getClosestMatchingStations(stationName) {
  // Find all stations with string includes.
  var regExpression = new RegExp(stationName)
      results = [];

  for (i=0; i < stationJSON.locations.length; i++) {
    var result = regExpression.exec(stationJSON.locations[i].name);
    if (result != null) { results.push(result.input) };
  }
  return results;
}

function getStationCode(stationName) { // Probably slow, but input order needs to be retained when searching.
  if (typeof(stationName) === 'object' || stationName instanceof Object) { // If input is an 1d array/list or object/hash-table.
    var sortOrder = {}; // Store empty hash-table so that input order is upheld.

    for (i=0; i<stationName.length; i++) {
      sortOrder[i] = stationName[i]; // Convert input array to object {index: val}.
    }

    for (i=0; i<stationJSON.locations.length;i++) {
      if (stationName.includes(stationJSON.locations[i].name)) {
        // If match exists: find the station which matches...
        for(n=0;n<stationName.length;n++) {
          if (stationName[n] == stationJSON.locations[i].name) {
            for (key in sortOrder) {
              if (sortOrder[key] === stationName[n]) { // Find the matching value.
                sortOrder[key] = stationJSON.locations[i].crs; // Store code under corresponding key.
              }
            }
            stationName.splice(n, 1); // Remove found station from list.
          }
        }
      }
    }
    return Object.values(sortOrder); // Return the completed hash table.

  } else if (typeof(stationName) === 'string'  || stationName instanceof String) { // Else if it's a string.
    var asArray = [stationName]; // Store as a list/array and then recurr.
    return getStationCode(asArray)[0]; // Return only index one, as there is only one value.
  } else { console.error('Incorrect input type: Enter a string or array of strings.') }
}

function findHighestFootFall(stationCode) { // "I'm not the lowest rank on this ship... What about the laboratory mice?"
  if (typeof(stationCode) === 'object' || stationCode instanceof Object) {
    var keys = Object.keys(stationRank)
        rank = 0
        highestRank = ['', keys.length];

    console.log('Arrrrgh!')
    for(i=0; i<keys.length;i++) {
      if (stationCode.includes(keys[i])) {
        for (code in stationCode) {
          if (stationCode[code] === keys[i]) {
            rank = [stationCode[code], stationRank[keys[i]]];
            if (rank[1] < highestRank[1]) { highestRank = rank }
          }
        }
      }
    }
    return highestRank;

  } else if (typeof(stationCode) === 'string'  || stationCode instanceof String) {
    var asArray = [stationCode];
    return findHighestFootFall(asArray);
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
  // If the input str is 3 chars and all uppercase, check against the stations file then return the loc.
  // Find all matching stations, then route out the abiguity by returning the most popular entry (highest footfall station).
  var allMatching = getClosestMatchingStations(locationStr);
  var matchingCodes = getStationCode(allMatching);
  if (matchingCodes.length == 1) {
    // Look up geo-cords for this spot.
    return getLocCoords(matchingCodes);
  } else {
    // Remove ambiguity.
    var resultStation = findHighestFootFall(matchingCodes)[0]; // <- Make the footfall rank a useful scaling bias!
    return getLocCoords(resultStation);
  }
}

// Add exports.
