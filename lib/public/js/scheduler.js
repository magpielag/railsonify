class Scheduler {
  // The idea is to create a set of function calls on timers relating to the timetable departure values - if the values change, timeouts can be cleared and reset at the correct times.
  constructor(timetable) {
    this.data = timetable[0];
    this.timetable = this.data.timetable;
    this.name = this.data.station;
    this.calls = [];
    this.runCall = function() {
      console.log(this.calls[0]);
      console.log(this.timetable[this.calls[0]]);
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

  setCalls() {
    function timeDifference(timeValue) {
      var now = new Date();
      var currentDate = now.toISOString().split('T')[0];
      var formattedTime = new Date(currentDate + ' ' + timeValue + ':00');
      return formattedTime.getTime() - now.getTime();
    }

    var timetableObject = this.data.timetable;
    var times = Object.keys(timetableObject);
    var information = Object.values(timetableObject)
    var departures = [];
    for (var i=0; i<times.length; i++) {
      var wrapper = {};
      wrapper[times[i]] = information[i];
      departures.push(wrapper);
    }
    var calls = [];
    console.log(departures.length);

    departures.forEach(function(dataObj) {
      var departTime = Object.keys(dataObj);
      var timeo = setTimeout(function() {
        console.log(dataObj); // < This is where drawing / sonification calls sit.
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

// TODO: 1. Figure out a system of refreshing outdated information and reassigning calls - figure out an interval for this.
// TODO: 2. Write local drawing function and execute this within the scheduled calls (eventually tone stuff will go here too.)
// TODO: 3. Look into improving this current system, you cannot do multiple schedulers at the same time with multiple inputs, not sure if
//          this is a problem on the server or client side.
