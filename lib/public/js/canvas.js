var canvas = document.getElementById('canvas')
    canContext = canvas.getContext('2d')
    height = canvas.height
    width = canvas.width
    fadeCanvas = document.createElement('canvas')
    fadeCanvas.height = height
    fadeCanvas.width = width
    fadContext = fadeCanvas.getContext('2d')
    canContext.lineWidth = 5
    centre = {};

const colours = {
  "SW": '#0092CA', "AW": '#C41816', "CC": '#C00084', "CH": '#192A46',
  "CS": '#002B2F', "EM": '#F39000', "ES": '#FFED00', "GC": '#F28532',
  "GN": '#501B77', "GR": '#C82C30', "GW": '#004A3F', "GX": '#FE0000',
  "HT": '#ED037C', "HX": '#352041', "IL": '#0092CA', "LE": '#D70428',
  "LM": '#F1830F', "LO": '#143A9C', "ME": '#FFF200', "NR": '#F6773A',
  "NT": '#262B5C', "NY": '#1F1F1F', "SE": '#00B1E4', "SN": '#408169',
  "TL": '#D73695', "TP": '#00B6EC', "WR": '#870044', "XC": '#B80139',
  "XR": '#8277B9', "SR": '#BBC2DB'
};


const bounds = {
  x: { min: -6.9868670003774405, max: 1.7624989748001116 },
  y: { min: 49.883228910354326, max: 59.08797604516907 }
  }; // Change if map changes (can find bounds using functions in tools/js/canvas).


function setColour(trainOperator) {
  var colour = colours[trainOperator];
  if ( colour != null ) {
    canContext.strokeStyle = colour;
  } else { canContext.strokeStyle = '#9EFF98'; }
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

centre.width = width / 2;
centre.height = height / 2;

async function getRouteArray(departureSrc, arrivalSrc) {
  console.log('Passing Data');
  console.log(departureSrc, arrivalSrc)
  var url = window.location + '/draw';
  $.ajax({
         type: "POST",
         url: '/draw',
         data: {departure: departureSrc, arrival: arrivalSrc},
         success: function(data) {
            if (data != null) {
              console.log('Success!');
              console.log(data);
              console.log(Object.keys(data)[0]);
              var dataKey = Object.keys(data)[0];
              var routeData = data[dataKey];
              var numRoutes = Object.keys(routeData);
              console.log(`Number of routes: ${numRoutes}`);

              for ( i = 0; i < numRoutes.length; i++ ) { // For each train route...
                var routeObject = routeData[numRoutes[i]];
                var scaledData = scaleBoundaries(height, width, routeObject.route);
                drawRoute(scaledData, routeObject.duration);
              }
            }
          },
         error: function (error) {
           console.error(error);
           console.log("Error: ", error.stack);
           console.log("Error: ", error.name);
           console.log("Error: ", error.message);
          }
       });
}

async function drawRoute(routeArray, durationJourney) {
  // Runs indefinitely...
  var drawIndex = 0;
  canContext.beginPath();
  canContext.moveTo(routeArray[0][0], routeArray[0][1]);
  routeArray.shift();
  var drawInterval = setInterval(function() {
    if ( drawIndex >= routeArray.length ) {
      clearInterval(drawInterval);
      delete drawIndex;
      return;
    } else {
      canContext.lineTo(routeArray[drawIndex][0], routeArray[drawIndex][1]);
      canContext.stroke();
      drawIndex++;
    }
  }, (durationJourney*60)/(routeArray.length*10));
}
