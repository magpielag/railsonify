/*

  API helper module, used to parse data fed from the API and reformat data fed from
  the user. An example problem:
  E.G. The user enters 'London', we need to then find a specific station within
       London to monitor.
       OR
  E.G. The user enters 'Shrewsbury', the API can't take this as an input, so we
       need to do an extra lookup to find the location (lat, long) or station
       code of Shrewsbury Rail Station.

*/

// Load in station and station rankings data.
const stationJSON = require('../store/json/stations.json') // Courtesy of George Goldberg (https://github.com/grundleborg).
      stationRank = require('../store/json/rankings.json'); // Courtesy of ORR (https://orr.gov.uk/statistics/published-stats/station-usage-estimates), formatted from CSV to JSON.

function crsGet(stationString) {
    /*
        Take an input string and find all stations with locations or names matching
        this string, then find the highest foot-traffic station in this matching
        group to feed back to the user.

        @param {string} stationString: A string containing a user input, if not
                                       valid, an empty list will be returned.
        @return {string} allMatching[first]: The highest footfall station's crs
                                             code is returned.

    */

    function getMatching(stationName) {
      /*

        Take an input station name and find the corresponding CRS code.

        @param {string} stationName.
        @return {string} results: A list of matching CRS codes, as for each location
                                  name there may be multiple stations.

      */
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

    /* If the input string is a crs format string, and is within the station
       ranking list, return it without doing a lookup. */
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
  /*
    Take a input string and find the latitude and longitude of the target station.

    @param {string} locationStr: See stationString.

    @return {object} <>: Object containing the longitude and latitude of the station.

  */
    function getLocCoords(stationCode) {
    // Given an input station code, find the location of the station.
    for (i=0; i<stationJSON.locations.length; i++) {
      if (stationJSON.locations[i].crs === stationCode) {
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
    return locGet(crsGet(locationStr)); // Reformat and recurr.
  }
}

function randSearch() {
  /*

    The user wants a set of random stations to test the application, rather than
    entering a set of locations themself. To do this, a random button triggers this
    function: Take the station rankings as a list of keys (crs codes) and generate
    three random integers - if this was done linearly with a range of 0 to length
    we would most likely end up with three low pop stations, so instead the index
    used to iterate through the randomisation process is cubed. Producing a result
    in a range of 1-2400, 1-600, and 1-88, finding a station in the total footfall list,
    the top 600 busiest stations, and the top 88 busiest stations, giving a variety of
    monitoring results.

    @returns {md-array} [stations, names]: Returns both the CRS codes and string
                                           names of the stations.

  */

  var ranks = Object.keys(stationRank);
  function makeInts() {
    var intList = [];
    for ( let r = 1; r < 4; r++ ) {
      // Cube the index then round it, range is 1 to this value.
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
  /*
    Used for user input station entries, returns the name of the station for a
    given CRS code.

    @param {array} crsList: An array of station codes (crs codes).

    @return {array} matches: Array of names with matching crs codes.
    
  */
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
