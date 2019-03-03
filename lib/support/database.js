// NEW CONDENSED SYSTEM USES INPUT DICTIONARIES RATHER THAN CONCECATED STRINGS.
const path = require('path');
const nedb = require('nedb');
const api = require(path.join(__dirname, '..', 'data', 'api'));
const find = require(path.join(__dirname, '..', 'data', 'lookup'));

async function init(lookup = 'timetable') {
  switch(lookup) {
    case 'timetable':
      return new nedb({ filename: path.join(__dirname, '..', 'store', 'db', 'timetable.db'), autoload:true });
      break;
    case 'location':
      return new nedb({ filename: path.join(__dirname, '..', 'store', 'db', 'routes.db'), autoload:true });
      break;
  }
}

async function store(database, lookupKey='timetable', lookupDict) {
  try {
    switch(lookupKey) {
      case 'timetable':
        if ( lookupDict.station == null ) { new Error('Incorrect input dictionary for timetable lookup');
        } else {
          var timetableData = await api.writeTimetable(database, find.crs(lookupDict.station));
          await database.insert(timetableData, function(e) { console.error(e); });
          return await init(lookupKey);
        }
        break;

      case 'location':
      if ( lookupDict.departure == null | lookupDict.arrival == null ) {
        if ( lookupDict.station == null ) {
          new Error('No input stations found during location lookup.')
        } else {
          new Error('A station-to-station route lookup requires two input station codes')
        }
      } else {
        var routeData = await api.writeRoute(lookupDict);
        await database.insert(routeData, function(e) { console.error(e); });
        return await init(lookupKey);
      }
      break;
    }
  } catch(error) { console.error(error); }
}

/* Find docs -> send docs.
        if 0 -> recurr with new db.
*/
async function grab(response, database, lookupDict) {
    // LookupDict is an object containing, usually, station: stationCodes.
    try {
      var keys = Object.keys( lookupDict );
      var lookupKey;
          if ( keys.includes('station') ) { lookupKey = 'timetable';
        } else if ( keys.includes('departure') ) { lookupKey = 'location';
          } else { new Error('Input dictionary is not formatted correctly for database lookup!') }
          // LookupDict should be formatted correctly: { departure: <crs>, arrival: <crs> }
          await database.find({}, async function(error, documents) {
            try {
              if ( documents.length <= 0 ) {
                throw "No documents or invalid lookup, rerunning";
              }
              for ( i = 0; i < documents.length; i++ ) {
                // Continue
                var docKeys = Object.keys(documents[i]);
                if (docKeys.includes(lookupDict.station) | docKeys.includes(`${lookupDict.departure}/${lookupDict.arrival}`)) {
                  response.send(documents[i]);
                  return;
                }
              }
              throw "No documents or invalid lookup, rerunning";
              }
            catch(error) {
              if ( error.toString() === "No documents or invalid lookup, rerunning" ) {
                console.log(error);
                database = await store(database, lookupKey, lookupDict);
                grab(response, database, lookupDict);
              }
            }
          });
        }
    catch(error) {
      console.error(error);
    }
}

module.exports = {
  new: init,
  store: store,
  grab: grab
}
