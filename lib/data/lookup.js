const stationJSON = require('../tools/json/stations.json')
      stationRank = require('../tools/json/rankings.json')
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

function getAllCodes(stationName) { // Probably slow, but input order needs to be retained when searching.
  if (typeof(stationName) === 'object' || stationName instanceof Object) { // If input is an 1d array/list or object/hash-table.
    var stationName = getClosestMatchingStations(stationName);
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
    return getAllCodes(asArray); // Return only index one, as there is only one value.
  } else { console.error('Incorrect input type: Enter a string or array of strings.') }
}

function findHighestFootFall(stationCode) { // "I'm not the lowest rank on this ship... What about the laboratory mice?"
  if (typeof(stationCode) === 'object' || stationCode instanceof Object) {
// Get a list of values instead of keys (ranks relating to keys) OR flip the key and values around.
// Iterate through the rank values until you find one that has a key within your input list.
// Find the key with the rank, return it.

    const keys = Object.keys(stationRank);
    for (i=0; i<keys.length; i++) {
      // Check codes against key of value.
      // If match, check which input value matches, then return it.
      if (stationCode.includes(stationRank[keys[i]])) {
        for (code in stationCode) {
          if (stationCode[code] === stationRank[keys[i]]) {
            return stationRank[keys[i]];  // parseInt(stationRank[keys[i]])
          }
        }
      }
    }

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

function findCRS(locationStr) {
  if (locationStr.length == 3) {
    if (Object.values(stationRank).includes(locationStr)) {
      return locationStr;
    }
  }
  var matchingCodes = getAllCodes(locationStr);
  if (matchingCodes.length == 1) {
    return matchingCodes[0];
  } else if (matchingCodes.length > 1) {
    return findHighestFootFall(matchingCodes);
  } else {
    console.error('No crs found with that input string.');
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
  crs: findCRS,
  location: findLocation
};
