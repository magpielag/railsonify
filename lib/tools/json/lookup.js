const stationJSON = require('./stations.json')
      stationPop = require('./newRanks.json');
      fs = require('fs')
      path = require('path')
      toConv = require('./stationranking.json');


function getLocation(stationCode) {

}

function matchToClosestStation(stationName) {
  var matches = [];
  var indices = [];
  for (i=0; i < stationJSON.locations.length; i++) {
    var reg = new RegExp(stationName);
    var strMatch = reg.exec(stationJSON.locations[i].name);
    if (strMatch != null && strMatch.length > 0) {
      matches.push(strMatch.input);
      indices.push(i);
    }
  }

  var indicesToDelete = [];
  for (i=0; i < matches.length; i++) {
    // Check that the 'input' string of the regex results contains other transport results (i.e. bus).
    var nameToCheck = matches[i].toLowerCase();
    if (nameToCheck.includes('bus')) { // Test cases to see what other results to check here.
      indicesToDelete.push(i);
    }
    console.log(matches[i], stationJSON.locations[indices[i]].crs);
  }

  for (i=0; i < indicesToDelete.length; i++) { // Delete all incorrect records.
    matches.splice(indicesToDelete[i], 1);
    indices.splice(indicesToDelete[i], 1);
  }

  var keys = Object.keys(stationPop);
  var rank;
  var topRank = keys.length+1;
  var correctIdx;

  // Convert keys in JSON to stationCodes, this will mean there's no ambiguity...
  keys.forEach(function(key) {
    for (station in matches) {
      //console.log(matches[station], key, matches[station].includes(key));
      if (matches[station].includes(key)) {
        var rank = stationPop[key];
        if (rank < topRank) {
          topRank = rank;
          correctIdx = station;
       }
      }
    }
  });

  var lookupIdx = indices[parseInt(correctIdx)];
  //console.log(stationJSON.locations[lookupIdx]);
  return stationJSON.locations[indices[correctIdx]].crs;

//console.log(matches[station]);

  // Convert json to be 'name': 'rank'.
    //if (stationPop.Station
}



function convertJSON() {
  newJson = {};
  for (i=0; i<toConv.length; i++) {
    var objKey = toConv[i].Station
        objVal = parseInt(toConv[i].Rank);
        //objShell = {}
        //objShell[objKey] = objVal;
    //newJson.push(objShell);
    newJson[objKey] = objVal;
  }
  newJson = JSON.stringify(newJson);
  fs.writeFileSync(path.join(__dirname, 'newRanks.json'), newJson);
  newJson = JSON.parse(newJson);
  console.log(newJson);
}

//convertJSON();
console.log(matchToClosestStation('London'));
