var canvas = document.getElementById('canvas')
    canContext = canvas.getContext('2d')
    height = canvas.height
    width = canvas.width
    fadeCanvas = document.createElement('canvas')
    fadeCanvas.height = height
    fadeCanvas.width = width
    fadContext = fadeCanvas.getContext('2d')
    centre = {};
canContext.strokeStyle = "#FFFF33";


const bounds = {
  x: { min: -6.9868670003774405, max: 1.7624989748001116 },
  y: { min: 49.883228910354326, max: 59.08797604516907 }
  }; // Change if map changes (can find bounds using functions in tools/js/canvas).


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
         data: {depart: departureSrc, arrive: arrivalSrc},
         success: function(data) {
            if (data != null) {
              console.log('Success!');
              console.log(data);
              var routeData = data[0].route;
              var scaled = scaleBoundaries(height, width, routeData);
              drawRoute(scaled);
            }
          },
         error: function (error) {
           console.error(error);
          }
       });
}

function drawRoute(routeArray) {
  console.log('Drawing Path:');
  canContext.beginPath();
  canContext.moveTo(routeArray[0][0], routeArray[0][1]);
  routeArray.slice(0, 1);
  for(i=0; i<routeArray.length; i++) {
        canContext.lineTo(routeArray[i][0], routeArray[i][1]);
        canContext.stroke();
  }
}
