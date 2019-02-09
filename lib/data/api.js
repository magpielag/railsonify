const fetch = require('node-fetch')
      path = require('path')
      canvasTools = require('../tools/js/canvas'); // Contains canvas build and draw methods.

function buildAPIAddress(baseUrl, id, key, stationCode=null, fromLong=null, fromLat=null, toLong=null, toLat=null) {
  // Maybe add a location lookup using station.json instead of using lonlat inputs.
  var url;
  switch (action) {
    case 'location':
    // Add a look up to check if the stations are within the tfl area, then switch service token.
      url = path.join(baseUrl, 'public', 'journey', 'from',
                      'lonlat:' + fromLong + ',' + fromLat,
                      'to', 'lonlat:' + toLong + ',' + toLat + '.json?app_id='
                      + id + '&app_key=' + key + '&service=southeast');
      return url;
      break;

    case 'timetable':
      url = path.join(baseUrl, 'train', 'station', stationCode,
                      'live.json?app_id=' + id + '&app_key=' + key
                      + '&darwin=true&train_status=passenger');
      return url;
      break;

      // Add additional if needed.
  }
}

function drawLocation(canvas, colour, apiUrl, fromStation, toStation) {
  // Using station codes in 'station' variables [e.g. 'ABC', 'LDS'].
  // Unsure if we want to build the url in this function or not.
  fetch(apiUrl)
  .then((response)=>response.json()) // Convert response to json data.
  .then(function(data) {
    const stationCoords = data.routes.route_parts
          locationCoordinates;
    for (i = 0; i < stationCoords.length; i++) {
      if (stationCoords[i].mode === "train") {
      locationCoordinates.push(stationCoords[i].coordinates);
      }
    }
    return locationCoordinates;
    //const locationCoordinates = data.routes.route_parts.coordinates;
  }).then((coordinates) => canvasTools.drawRoute(canvas, coordinates, '#FFC0CB')) // Colour is set.
  .catch(error, function(error) { console.error(error); });
}

module.exports = {
  draw: drawLocation
}
