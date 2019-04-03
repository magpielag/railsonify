function getColour(trainOperator) {
  var colour = colours[trainOperator];
  if ( colour != null ) {
    return colour
  } else { return '#9EFF98'; }
}

function scaleBoundaries(canWidth, canHeight, data) {
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

async function buildCanvas(h, w, c_Id) {
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
    console.log('DEBUG DRAW: Canvas List:', canvasList.length, canvasList);
    return c;
    // Returning the default canvas (already exists with map background).
  } else {

    var c_Elem = document.createElement('canvas');
    c_Elem.id = `canvas${c_Id}`;
    c_Elem.height = h, c_Elem.width = w;
    canvasDiv.appendChild(c_Elem);

    var c = {
      'id': c_Id,
      'canvas': c_Elem,
      'inUse': false
    };
    await canvasList.push(c);
    console.log('DEBUG DRAW: Canvas List:', canvasList.length, canvasList);
    return c;
  }
}

async function getUnflagged(_canvasList) {
  /*
    Check canvases in use: Find one that isn't in use, OR create a new one.
    Returns a new canvas object if there's no usable canvases, or returns the
    first usable canvas in the list.
  */
  console.log('FLAG DEBUG:', _canvasList.length);
  for ( ca = 0; ca < _canvasList.length; ca++ ) {
    var canvasObject = _canvasList[ca];
    console.log(canvasObject);
    console.log('FLAG DEBUG: running check', canvasObject.inUse == true);
    console.log(ca, canvasObject.inUse, canvasList.length-1)
    if ( canvasObject.inUse === true && ca == (canvasList.length-1) ) {
      console.log('DEBUG DRAW: Building canvas and returning');
      return await buildCanvas(canvasObject.canvas.height, canvasObject.canvas.width, ca+1);

    } else if ( canvasObject.inUse == false ) {
      console.log('DEBUG DRAW: Returning canvas.');
      return canvasObject;
    }
  }
}

const colours = { // Each colour matches a rail provider logo.
  "SW": '#0092CA', "AW": '#C41816', "CC": '#C00084', "CH": '#192A46',
  "CS": '#002B2F', "EM": '#F39000', "ES": '#FFED00', "GC": '#F28532',
  "GN": '#501B77', "GR": '#C82C30', "GW": '#004A3F', "GX": '#FE0000',
  "HT": '#ED037C', "HX": '#352041', "IL": '#0092CA', "LE": '#D70428',
  "LM": '#F1830F', "LO": '#143A9C', "ME": '#FFF200', "NR": '#F6773A',
  "NT": '#262B5C', "NY": '#1F1F1F', "SE": '#00B1E4', "SN": '#408169',
  "TL": '#D73695', "TP": '#00B6EC', "WR": '#870044', "XC": '#B80139',
  "XR": '#8277B9', "SR": '#BBC2DB' };
const bounds = {
    x: { min: -6.9868670003774405, max: 1.7624989748001116 },
    y: { min: 49.883228910354326, max: 59.08797604516907 }
}; // Change if map changes (can find bounds using functions in tools/js/canvas).
var canvasDiv = document.getElementById('map'); // Core div all canvas sit in.
var canvasList = [];
buildCanvas(null, null, 0); // Init default canvas.


async function drawRoute(operator, routeArray, durationJourney) {
  var drawCanvas = await getUnflagged(canvasList);
  console.log('Canvas is: ', drawCanvas);
  var context = drawCanvas.canvas.getContext('2d');
  context.lineWidth = 4;
  context.strokeStyle = await getColour(operator);
  canvasList[drawCanvas.id].inUse = true;
  console.log('Canvas check:');
  console.log(canvasList);
  console.log(canvasList[drawCanvas.id]);
  var drawIndex = 0;
  context.beginPath();
  context.moveTo(routeArray[0][0], routeArray[0][1]);
  console.log('Moving to', routeArray[0]);
  routeArray.shift();
  var drawInterval = setInterval(async function() {
    if ( drawIndex >= routeArray.length ) {
      console.log('Ending DRAW');
      canvasList[drawCanvas.id].inUse = false;
      console.log(canvasList[drawCanvas.id]);
      clearInterval(drawInterval);
      return;
    } else {
      context.lineTo(routeArray[drawIndex][0], routeArray[drawIndex][1]);
      context.stroke();
      drawIndex++;
    }
  }, (durationJourney * 60)/(routeArray.length * 10));
}

async function getRouteArray( departureSrc, arrivalSrc, operator, isLate ) {
  console.log('DEBUG DRAW: inside draw function');
  console.log(departureSrc, arrivalSrc, operator);
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
      // Add 'is late' bool to data then trigger a synth line here.
      console.log('DEBUG DRAW: Route num: ', numRoutes);

      for ( r = 0; r < numRoutes.length; r++ ) { // For each train route...
        // Add routes together.
        if ( r == 0) { var routeData = routeObject[numRoutes[r]].route;
        } else {
          routeData = routeData.concat(routeObject[numRoutes[r]]);
        }
        console.log('Duration:', routeObject, routeObject[numRoutes[r]].duration);
        duration = duration + routeObject[numRoutes[r]].duration;
      }

      var scaledData = scaleBoundaries(canvasList[0].canvas.height,
          canvasList[0].canvas.width, routeData);
      console.log('DEBUG DRAW: drawing route for ', dataKey);
      console.log('DEBUG VALUES:', routeObject);
      var mapSynth = new MapSynth({late: isLate, duration: duration,
        route: scaledData});
      console.log('Playing synth!');
      mapSynth.start();
      drawRoute(operator, scaledData, duration);
      return;
    },
   error: function (error) {
     console.error(error);
     console.log("Error: ", error.stack);
     console.log("Error: ", error.name);
     console.log("Error: ", error.message);
    }
  });
}
