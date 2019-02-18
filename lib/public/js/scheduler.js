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

  /*runCall() {
    console.log(this.calls[0]);
    console.log(this.timetable[this.calls[0]]);
    this.calls.splice(0, 1);
  }

  setCall(departureTime, details) {

      console.log(`Executing in... ${timeDifference/1000}`)
      var timeoutFunction = setTimeout(function() {
        console.log(this);
        console.log(this.calls);
        this.runCall();
      }, timeDifference);
      return timeoutFunction;
    }
*/


  setCalls() {
    function timeDifference(timeValue) {
      var now = new Date();
      var currentDate = now.toISOString().split('T')[0];
      var formattedTime = new Date(currentDate + ' ' + timeValue + ':00');
      return formattedTime.getTime() - now.getTime();
    }
    var dataObject = this.data;
    var times = Object.keys(dataObject.timetable);
    var departures = [];
    for (var i=0; i<times.length; i++) {
      departures.push([times[i], dataObject.timetable[times[i]]])
    }
    var calls = [];
    // Instead of setting timeouts with departure times, which are required.
    departures.forEach(function(departureArray) {
      var timeo = setTimeout(function() {
        console.log(departureArray[0], departureArray[1]);
      }, timeDifference(departureArray[0]));
      calls.push(timeo);
      console.log(timeDifference(departureArray[0])/1000);
    });
    return calls;
  }

  start() {
      this.calls = this.setCalls();
    }
}


$("#stationForm").submit(function(e) {
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

// On post: 1. Set up Schedueler - could use cron if setTimeout is not working correctly.
