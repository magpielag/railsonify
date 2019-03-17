function addTime(hhmm, addMins) {
  var hours = parseInt(hhmm.substring(0, 2))
      minutes = parseInt(hhmm.substring(3, 5))
      addMins = parseInt(addMins)
      newMins = minutes + addMins;

  const negMod = (x, n) => (x % n + n) % n


  if (newMins >= 60) {
    newMins = newMins % 60;
    hours++;
  } else if (newMins < 0) {
    newMins = 60 + newMins;
    hours--;
  }

  if (hours > 23) {
    stringHours = '0' + (hours % 24).toString();
  } else if (hours < 0) {
    stringHours = negMod(hours, 24).toString();
  } else if (hours == 0) {
    stringHours = '00';
  } else {
    stringHours = hours.toString();
  }

  stringMinutes = newMins.toString();

  if (stringMinutes.length == 1) {
    stringMinutes = '0' + stringMinutes;
  } else if (stringMinutes.length == 3) {
    console.error('Time value is incorrect format.')
  }

  return `${stringHours}:${stringMinutes}`;
}

function lowestDuration(timeArray) {
  intArray = [];
  for (i=0; i<timeArray.length; i++) {
    var fixedStr = timeArray[i].replace(':', '');
    var asInt = parseInt(fixedStr);
    intArray.push(asInt);
  }
  var minVal = Math.min(...intArray);
  return intArray.indexOf(minVal);
}

function convertToMins(timeStr) {
  // Input eg: "00:14:00", output eg: "14"
  var splitString = timeStr.split(':')
      hours = parseInt(splitString[0])
      mins = parseInt(splitString[1])
      secs = parseInt(splitString[2]);

  if ( hours > 0 ) { mins = mins + ( hours * 60 )
  } else if ( secs > 0 ) { mins = mins + ( secs / 60 ) }

  return mins;
}

function compareTime(currentTime, compareTime) {
// Checks two input time strings, e.g: "12:37" > "08:51"
// Needs to treat time as 24hr rather than 12hr.

  var timeStrings = [currentTime, compareTime];
  var timeVals = [];

  timeStrings.forEach(function(strElem) {
    var strPieces = strElem.split(':');
    var timeAsInt = parseInt(strPieces[0] + strPieces[1]);
    timeVals.push(timeAsInt);
  });

  console.log(timeVals);

  if ( timeVals[0] > timeVals[1] ) {
    return true
  } else if ( timeVals[0] == timeVals[1] ) {
    return null
  } else { return false }

}

module.exports = {
  addTime: function(t1, t2) { return addTime(t1, t2) },
  lowestDuration: lowestDuration,
  minuteConvert: function(minString) { return convertToMins(minString); },
  compare: compareTime
}
