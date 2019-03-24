// NEW CONDENSED SYSTEM USES INPUT DICTIONARIES RATHER THAN CONCECATED STRINGS.
const path = require('path');
const nedb = require('nedb');
const api = require(path.join(__dirname, '..', 'data', 'api'));
const find = require(path.join(__dirname, '..', 'data', 'lookup'));
const compareTime = require(path.join(__dirname, 'time')).compare;

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
    console.log('STORE');
    switch(lookupKey) {
      case 'timetable':
        if ( lookupDict.station == null ) { new Error('Incorrect input dictionary for timetable lookup');
        } else {
          var timetableData = await api.writeTimetable(database, find.crs(lookupDict.station));
          console.log('STORING:');
          console.log(timetableData);
          await database.insert(timetableData, function(e) { console.error(e); });
          return init('timetable');
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
        if ( routeData.error != null ) {
          return routeData;
        } else {
        await database.insert(routeData, function(e) { console.error(e); });
        return database;
        //await init(lookupKey);
        }
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
      var keys = Object.keys( lookupDict ); // Grab keys to figure out what the lookup type is.
      var lookupKey;
          if ( keys.includes('station') ) { lookupKey = 'timetable';
        } else if ( keys.includes('departure') ) {
          if ( lookupDict.departure == null | lookupDict.arrival == null ) {
            throw "Invalid arrival or departure inputs!"
          } else {
            lookupKey = 'location';
          }
        } else { new Error('Input dictionary is not formatted correctly for database lookup!') }
          // LookupDict should be formatted correctly: { departure: <crs>, arrival: <crs> }
          console.log('DEBUG DRAW:', ` lookup key is ${lookupKey}`);
          console.log('DEBUG DRAW:', `database integrity - ${database}`);
          await database.find({}, async function(error, documents) { // Async nedb function, pulls all documents from database.
            try {
              if ( documents.length <= 0 ) {
                console.log("DEBUG:", documents);
                throw "No documents"; // No documents in route.db, store some.
              }
              for ( i = 0; i < documents.length; i++ ) {
                // Continue
                var docKeys = Object.keys(documents[i]);
                console.log('DEBUG:', docKeys.includes(lookupDict.station), lookupDict);
                if (docKeys.includes(lookupDict.station) | docKeys.includes(`${lookupDict.departure}/${lookupDict.arrival}`)) {
                  console.log(`Sending!`);
                  console.log(documents[i]);
                  response.send(documents[i]);
                  throw "Documents sent";
                }
              }
              console.log('DEBUG:', lookupDict, documents);
              throw "Invalid documents"
              }
            catch(error) {
              console.log(error);
              if ( error.toString() == "No documents" | error.toString() == "Invalid documents" ) {
                console.log("No documents found, running store function... ");
                database = await store(database, lookupKey, lookupDict);
                if ( database == null ) { console.error('Database is not valid'); }
                if ( database.error != null ) {
                  throw 'Server non-response from transport API!'
                } else {
                  return grab(response, database, lookupDict);
                }
              } else if ( error.toString().includes('server') ) {
                response.status(500).send('Could not connect to transport API');
                }
              }
          });
          return database;
        }
    catch(error) {
      console.error(error);
    }
}

async function update(database, time, stationCode) {

  function purge(database, docID) {
    database.remove( { _id: docID }, { multi: true }, function(error, nRemoved) {
      if ( !error ) {
        console.log('DEBUG DB: ', `deleting ${nRemoved} documents`);
      } else { throw error.toString(); }
   });
   return database;
  }

  // TODO: Need a function to wipe database on startup and schedule to every day?
 /*
    Vars: Database <nedb object>; time <str or uuid> containing datestamp.

    Look through documents, finding those behind the current input time.
    Delete all out of date documents, and replace them with up to date ones.
    Only works with timetable, as it only really needs to!
 */

 var toStore = false;

 await database.find( {} , async function( error, documents ) {
   if ( !error ) {
     for (s=0; s<documents.length; s++) {
       var documentArr = Object.keys(documents[s]);
       if ( documentArr[0] == stationCode ) {
         console.log('DEBUG DB:', ` found station ${documentArr[0]}: updating`);
         var timetableObj = documents[s][documentArr[0]];
         var departures = Object.keys(timetableObj);
         // Unpack departure times.
         if ( departures.length == 0 ) {
           toStore = true;
           database = purge(database, documents[s][documentArr[1]]);
         }
         for ( d = 0; d < departures.length; d++ ) {
           // Iterate through departure times, if one is out of time, delete the entry.
           if ( departures[d] == 'null' | !compareTime(departures[d], time)) {
            toStore = true;
            database = purge(database, documents[s][documentArr[1]]);
            d = departures.length;
           }
         }
       }
     }
   }
 });
   if ( toStore == true ) {
     database = await store(database, 'timetable', {station: stationCode});
     return database;
  } else {
    return database;
  }
}

module.exports = {
  new: init,
  store: store,
  grab: grab,
  update: update
}
