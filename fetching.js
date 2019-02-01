// Aims: Think more about garbage collections - lots of data flying around, maybe clean up objects when not needed.

const fetch = require('node-fetch');
const timeTableList = [];

class Timetable {
  constructor(data) {
    this.time = { aimed: {}, status: null, expected: {} };
    this.time.aimed.depart = data.aimed_departure_time;
    this.time.aimed.arrival = data.aimed_arrival_time;
    this.time.status = data.status;
    this.time.expected.depart = data.expected_departure_time;
    this.time.expected.arrival = data.expected_arrival_time;
    // Subtract times to find difference (lateness)
    // Match station names to location (coordinates - lat and long)
  }
}

// Find a better way of getting api information into the string using join. <======
fetch('https://transportapi.com/v3/uk/train/station/LDS/live.json?app_id=36ff295c&app_key=ce8c14bfd3aadbcf111080f60eeac3ac&darwin=false&train_status=passenger')
  .then((resp) => resp.json())
  .then(function(data) {
    const departures = data.departures.all;
    for (train in departures) {
      timeTableList.push(new Timetable(departures[train]));
    }
  })
  .then(function() { console.log(timeTableList[0]) })
  .catch(function(error) {
    console.log(error);
    throw error;
  });
