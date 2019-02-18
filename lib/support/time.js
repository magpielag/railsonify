function addTime(hhmm, addMins) {
  var hours = parseInt(hhmm.substring(0, 2))
      minutes = parseInt(hhmm.substring(3, 5))
      addMins = parseInt(addMins)
      newMins = minutes + addMins;

  const negMod = (x, n) => (x % n + n) % n


  if (newMins > 60) {
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
    console.log(stringMinutes);
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

module.exports = {
  addTime: function(t1, t2) { return addTime(t1, t2) },
  lowestDuration: lowestDuration
}

console.log(lowestDuration(['12:30:00', '14:45:00', '01:10:10']));