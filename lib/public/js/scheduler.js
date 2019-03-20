var draw = async function(dep, arr) { return getRouteArray(dep, arr); }
var timeDifference = function(timeValue) {
  var now = new Date();
  var currentDate = now.toISOString().split('T')[0];
  var formattedTime = new Date(currentDate + ' ' + timeValue + ':00');
  return formattedTime.getTime() - now.getTime();
}

class Scheduler {
  // The idea is to create a set of function calls on timers relating to the timetable departure values - if the values change, timeouts can be cleared and reset at the correct times.
  constructor(timetable) {
    var self = this;
    self.draw = draw;
    //self.data = timetable;
    console.log('Data in scheduler');
    console.log(timetable);
    self.name = Object.keys(timetable)[0];
    self.timetable = timetable[self.name];
    //self.timetable = self.data.timetable;
    self.calls = [];
    self.runCall = function() {
      console.log('Running call...')
      self.calls.splice(0, 1);
    }

    self.refresh = function() {
          // When the calls list is empty.
          // AJAX call to server to update database, then rerun setCalls();
          // TODO: Continue
          console.log('Posting refresh');
          $.ajax({
                 type: "POST",
                 url: window.location.href + 'update',
                 data: self.name,
                 success: function(data)
                 {
                    console.log(`Refresh data`);
                    console.log(data);
                    // Refill the calls with the new data.
                    self.timetable = data;
                    console.log(`timetable set to: ${self.timetable}`);
                    self.calls = setCalls();
                 },
                 error: function (data) {
                   console.log('An error occurred.');
                  }
               });
    }
    self.setCalls = function() {
      var timetableObject = self.timetable;
      var times = Object.keys(timetableObject);
      var information = Object.values(timetableObject)
      var departures = [];
      var refresh  = self.refresh;
      for (var i=0; i<times.length; i++) {
        var wrapper = {};
        wrapper.station = self.name;
        wrapper[times[i]] = information[i];
        wrapper['draw'] = self.draw;
        departures.push(wrapper);
      }
      var calls = [];
      console.log(departures);

      // If no departures... SetTimeout for endTime and rerun on that timeout.

     departures.forEach(function(dataObj) {
        var departTime = Object.keys(dataObj)[1];
        var refreshFunc = refresh;
        console.log(refresh, refreshFunc);
        var timeo = setTimeout(async function() {
          if (departTime != 'null') {
            console.log('Data in scheduler:');
            console.log(dataObj);
            setColour(dataObj[departTime].operator);
            await dataObj.draw(dataObj.station, dataObj[departTime].destination);
            await calls.shift(); // Pop the first call from the list (should be self call).
            if ( calls.length == 0 ) { console.log('Refreshing!');
                                       refresh(); }
          } else { console.log('Skipping cancelled train'); }
        }, timeDifference(departTime));
        calls.push(timeo);
        console.log(timeDifference(departTime)/1000);
      });
      return calls;
    }
    this.start = function() {
      self.calls = self.setCalls();
    }
  }

  time() {
    return new Date().getTime();
  }

  date() {
    var now = new Date();
    return now.toISOString().split('T')[0];
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
