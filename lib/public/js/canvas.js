/*

  Client side canvas control, handles the allocation and drawing of multiple
  canvas elements in the DOM.

*/

const colours = { // Each colour matches a rail provider colour scheme, see report.
  "SW": '#0092CA', "AW": '#C41816', "CC": '#C00084', "CH": '#192A46',
  "CS": '#002B2F', "EM": '#F39000', "ES": '#FFED00', "GC": '#F28532',
  "GN": '#501B77', "GR": '#C82C30', "GW": '#004A3F', "GX": '#FE0000',
  "HT": '#ED037C', "HX": '#352041', "IL": '#0092CA', "LE": '#D70428',
  "LM": '#F1830F', "LO": '#143A9C', "ME": '#FFF200', "NR": '#F6773A',
  "NT": '#262B5C', "NY": '#1F1F1F', "SE": '#00B1E4', "SN": '#408169',
  "TL": '#D73695', "TP": '#00B6EC', "WR": '#870044', "XC": '#B80139',
  "XR": '#8277B9', "SR": '#08088A' };

const bounds = { // Lat/lon boundaries of station grid in the UK.
    x: { min: -6.9868670003774405, max: 1.7624989748001116 },
    y: { min: 49.883228910354326, max: 59.08797604516907 }
};

var canvasDiv = document.getElementById('map'); // Core div all canvas sit in.
var canvasList = [];
buildCanvas(0); // Init default canvas.

function getColour(trainOperator) {
  var colour = colours[trainOperator];
  if ( colour != null ) {
    return colour
  } else { return '#9EFF98'; } // Default grey colour.
}

function scaleBoundaries(canWidth, canHeight, data) {
  /*

    Scales latitude and longitude values into pixels within the 1000x1000
    canvas range.

    @param {int} canWidth, canHeight: Defaults to 1000, included incase future
                                      improvements warrant a bigger canvas.
    @param {mdarray} data: Route data (lat and longs) to convert to pixel values.

    @return {mdarray} data: Transformed array (pixel x, y values).

  */

  var dimensions = {x: canWidth, y: canHeight};
  var range = { x: (bounds.x.max - bounds.x.min),
                y: (bounds.y.max - bounds.y.min) };
  var ratio = { x: range.x / dimensions.x, y: (range.y / dimensions.y) };
  ratio.max = ratio.x > ratio.y ? ratio.x : ratio.y
  var center = { x: (dimensions.x - range.x / ratio.max ) / 2, y: (dimensions.y - range.y / ratio.max) / 2 };

  for (i=0; i<data.length; i++) {
      data[i] = transform(data[i]);
  }

  return data;

  function transform(arr) {
  		arr[0] = (arr[0] - bounds.x.min) / range.x * (range.x / ratio.max) + center.x;
  		arr[1] = (1 - (arr[1] - bounds.y.min) / range.y) * (range.y / ratio.max) + center.y;
      return arr;
  	}
}

async function buildCanvas(c_Id) {
  /*
    Initalise a canvas element, give it some details, append it to the main div,
    then return the standard format object for use in the rest of the client code.
  */
  if ( c_Id == 0 ) {
    var c = {
      'id': 0,
      'canvas': document.getElementById('canvas0'),
      'inUse': false
    };
    await canvasList.push(c);
    return c;
    // Returning the default canvas (already exists with map background).
  } else {
    let c = {
      id: canvasList.length,
      canvas: document.getElementById(`canvas${canvasList.length}`),
      inUse: false
    }
    await canvasList.push(c);
    return c;
  }
}

async function getUnflagged(_canvasList) {
  /*
    Check canvases in use: Find one that isn't in use, OR create a new one.
    Returns a new canvas object if there's no usable canvases, or returns the
    first usable canvas in the list.
  */
  for ( ca = 0; ca < _canvasList.length; ca++ ) {
    var canvasObject = _canvasList[ca];
    if ( canvasObject.inUse == true && ca == (canvasList.length-1) ) {
      return await buildCanvas(ca+1);
    } else if ( canvasObject.inUse == false ) {
      return canvasObject;
    }
  }
}

async function drawRoute(routeObject) {
  var interval = ((routeObject.duration * 60 ) * 10) / routeObject.route.length
      drawCanvas = await getUnflagged(canvasList);

  let canvasElems =   [...document.getElementsByClassName('canvas')];
  canvasElems[drawCanvas.id].setAttribute('class', "drawnCanvas");
  drawCanvas.context = await drawCanvas.canvas.getContext('2d');
  drawCanvas.context.lineWidth = 4;
  drawCanvas.context.strokeStyle = await getColour(routeObject.operator);
  canvasList[drawCanvas.id].inUse = true;

  setTimeout(function() {
    canvasList[drawCanvas.id].inUse = false;
    canvasElems[drawCanvas.id].setAttribute('class', "canvas");
  }, interval * routeObject.route.length + 10);
  runInterval(drawCanvas, routeObject);
}

async function getRouteArray( departureSrc, arrivalSrc, operator, isLate ) {
  var url = `${window.location}/draw`;
  $.ajax({
    type: "POST",
    url: '/draw',
    data: {departure: departureSrc, arrival: arrivalSrc},
    success: function(data) {
      console.log('DEBUG DRAW: Successfully retrieved data.');
      console.log(data);
      var dataKey = Object.keys(data)[0];
      var routeObject = data[dataKey];
      var numRoutes = Object.keys(routeObject);
      var duration = 0;

      for ( r = 0; r < numRoutes.length; r++ ) { // For each train route...
        // Add routes together.
        if ( r == 0) { var routeData = routeObject[numRoutes[r]].route;
        } else {
          routeData = routeData.concat(routeObject[numRoutes[r]]);
        }
        duration = duration + routeObject[numRoutes[r]].duration;
      }

      var scaledData = scaleBoundaries(canvasList[0].canvas.height,
          canvasList[0].canvas.width, routeData);
      var dataObject = {route: scaledData, duration: duration, late: isLate, operator: operator};
      drawRoute(dataObject);
      return;
    },
   error: function (error) {
     console.error(error);
     console.log("Error: ", error.stack);
    }
  });
}
