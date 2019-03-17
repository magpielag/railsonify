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
          await database.find({}, async function(error, documents) { // Async nedb function, pulls all documents from database.
            try {
              if ( documents.length <= 0 ) {
                throw "No documents"; // No documents in route.db, store some.
              }
              for ( i = 0; i < documents.length; i++ ) {
                // Continue
                var docKeys = Object.keys(documents[i]);
                if (docKeys.includes(lookupDict.station) | docKeys.includes(`${lookupDict.departure}/${lookupDict.arrival}`)) {
                  response.send(documents[i]);
                  throw "Documents sent";
                }
              }
              throw "Invalid documents"
              }
            catch(error) {
              console.log(error);
              if ( error.toString() == "No documents" | error.toString() == "Invalid documents" ) {
                console.log("No documents found, running store function... ");
                database = await store(database, lookupKey, lookupDict);
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

async function update(database, time) {
  // TODO: Need a function to wipe database on startup and schedule to every day?
 /*
    Vars: Database <nedb object>; time <str or uuid> containing datestamp.

    Look through documents, finding those behind the current input time.
    Delete all out of date documents, and replace them with up to date ones.
    Only works with timetable, as it only really needs to!
 */
 await database.find( {} , async function( error, documents ) {
   if ( !error ) {
     console.log(documents.length);

     // Iterate through documents to find both each key and each document relating to that key.
     for (s=0; s<documents.length; s++) {
       var docList = Object.keys(documents[s]); // Gets station codes.
       var timetableList = documents[s][docList[0]]; // Get contents of station docs.
       if ( timetableList != null ) {
         console.log('Pruning db for ', docList[0], s);
         var departures = Object.keys(timetableList);
         for ( d = 0; d < departures.length; d++ ) {
           var departure = departures[d];
           if ( departure != 'null' && !compareTime(departure, time) ) {
             console.log(departure, time);
             database.remove({_id:documents[s][docList[1]]}, { multi: true }, function(err, removed) {
               console.log(documents[s][docList[0]]);
               console.log('Removed');
               if (err) { throw err; }
            });
            console.log('Storing for ', docList[0]);
            database = await store(database, 'timetable', {station:docList[0]});
            d = departures.length;
            console.log('Ending');
            // If one time is out, just delete the whole doc.
           // Database entries now only contain documents relating to departure times after the input time.
         }
       }
      } else { throw "No timetable"; }
     }
    // return db;
   } else { throw error.toString(); } // Unsure if this is an object and can be treated as such?
 });
 return database;
}

var database = new nedb({ filename: path.join(__dirname, '..', 'store', 'db', 'timetable.db'), autoload:true });
update(database, '14:00');
//store(database, 'timetable', {station: 'NWT'});
module.exports = {
  new: init,
  store: store,
  grab: grab,
  update: update
}
