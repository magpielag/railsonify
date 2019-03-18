var draw = function(dep, arr) { getRouteArray(dep, arr); }
var timeDifference = function(timeValue) {
  var now = new Date();
  var currentDate = now.toISOString().split('T')[0];
  var formattedTime = new Date(currentDate + ' ' + timeValue + ':00');
  return formattedTime.getTime() - now.getTime();
}

class Scheduler {
  // The idea is to create a set of function calls on timers relating to the timetable departure values - if the values change, timeouts can be cleared and reset at the correct times.
  constructor(timetable) {
    // CRS: { }
    this.draw = draw;
    //this.data = timetable;
    console.log('Data in scheduler');
    console.log(timetable);
    this.name = Object.keys(timetable)[0];
    this.timetable = timetable[this.name];
    //this.timetable = this.data.timetable;
    this.calls = [];
    this.runCall = function() {
      console.log('Running call...')
      this.calls.splice(0, 1);
    }
  }

  time() {
    return new Date().getTime();
  }

  date() {
    var now = new Date();
    return now.toISOString().split('T')[0];
  }

  refresh(callsList) {
    // When the calls list is empty.
    // AJAX call to server to update database, then rerun setCalls();
    // TODO: Continue
  }

  setCalls() {
    var timetableObject = this.timetable;
    var times = Object.keys(timetableObject);
    var information = Object.values(timetableObject)
    var departures = [];
    for (var i=0; i<times.length; i++) {
      var wrapper = {};
      wrapper.station = this.name;
      wrapper[times[i]] = information[i];
      wrapper['draw'] = this.draw;
      departures.push(wrapper);
    }
    var calls = [];
    console.log(departures);


   departures.forEach(function(dataObj) {
      var departTime = Object.keys(dataObj)[1];

      var timeo = setTimeout(function() {
        if (departTime != 'null') {
          console.log('Data in scheduler:');
          console.log(dataObj);
          setColour(dataObj[departTime].operator);
          dataObj.draw(dataObj.station, dataObj[departTime].destination);
          calls.shift(); // Pop the first call from the list (should be this call).
          if ( calls.length == 0 ) { this.refresh(); }
        } else { console.log('Skipping cancelled train'); }
      }, timeDifference(departTime));
      calls.push(timeo);
      console.log(timeDifference(departTime)/1000);
    });
    return calls;
  }

  start() {
      this.calls = this.setCalls();
    }
}


$("#stationForm").submit(async function(e) {
    var form = $(this);
    var url = form.attr('action');

    $.ajax({
           type: "POST",
           url: url,
           data: form.serialize(), // serializes the form's elements.
           success: function(data)
           {
               console.log('Received data:');
               console.log(data);
               var s = new Scheduler(data);
               s.start();
           },
           error: function (data) {
             console.log('An error occurred.');
             console.log(data);
            }
         });
    e.preventDefault(); // avoid to execute the actual submit of the form.
});

// POST function that forces server to check databases up to a time period, removing entries under that time and refreshing the values above that time value.
