const mongoose = require('mongoose');
const fetch = require('node-fetch');

function initDB(dbUrl) {
  mongoose.connect(dbUrl); // TODO: CHANGE THIS ONCE FINALISED AN ONLINE DESTINATION?
  var db = mongoose.connection;
  db.on("error", console.error.bind(console, "connection error"));
  db.once("open", function(callback) {
    console.log("connected to mongo database");
  });

  var mongoSchema = mongoose.Schema({
    operator: String,
    time: { expected: {
            arrive: String,
            depart: String,
          },
          aimed: {
            arrive: String,
            depart: String,
          },
          status: String,
    },
    origin: String,
    destination: String
  })

  var railModel = mongoose.model('rail', mongoSchema);

  var database = {main: db, schema: mongoSchema, model: railModel};
  return database;
} // Initialise database, then return useful objects.


function fetchIntoDB(database, stationCode, id, key, modifierStr) {
  let url = 'https://transportapi.com/v3/uk/train/station/' + stationCode
    + '/live.json?app_id=' + id + '&app_key=' + key + '&darwin=false&train_status=passenger';

  fetch(url).then((response)=>response.json())
  .then(function(jsonData) {
    database.model = mongoose.model(stationCode, database.schema);
    let parsedData = jsonData.departures.all;
    console.log(`length is ${parsedData.length}`)
    for (i = 0; i <= parsedData.length; i++) {
      let dataCol = parsedData[i];
      let newEntry = new database.model({
        operator: dataCol.operator_name,
        time: { expected: {
                arrive: dataCol.expected_arrival_time,
                depart: dataCol.expected_departure_time,
              },
              aimed: {
                arrive: dataCol.aimed_arrival_time,
                depart: dataCol.aimed_departure_time,
              },
              status: dataCol.status,
        },
        origin: dataCol.origin_name,
        destination: dataCol.destination_name,
    });
    if (modifierStr === 'update') {
      database.model.deleteMany({}, function(err) {
        if (err) throw err;
    });
  }
    newEntry.save()
    .then(file => {
      console.log("Entry successful.")
    })
    .catch(err => {
      console.error(err);
    });
  }
}).catch(err => {
  console.error(err);
});
// End
}

function grabRecords(db) {
  db.model.find({}, function(err, data) {
    if (err) { throw err;
    } else {
      // Magic happens here.
    }
  })
}



module.exports = {
  init: initDB,
  store: fetchIntoDB,
  get: grabRecords
}
