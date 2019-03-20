const topojson = require('topojson')
  fs = require('fs')
  path = require('path')
  fetch = require('node-fetch')
  renderOptions = {
        			padding: 10,
        			fillColor: "#000000",
        			strokeColor: "#5A5A5A",
        			strokeWidth: 1
        		};

var bounds = {}
    Canvas = require('canvas')
    client = require('topojson/node_modules/topojson-client')
    mapData = require('../json/uk.json')
    canvas = Canvas.createCanvas(1000, 1000);

function convertJSON(jsontopData) {
  // TODO: Perhaps change this to find the object key automatically, if possible?
  geojson = topojson.feature(jsontopData, jsontopData.objects['GBR_adm2'])
  return geojson;
}

function iterateFeatures(feature, callback) {
  switch (feature.geometry.type) { // Find the type of polygon/geometric shape.
      case "MultiPolygon": // If MultiPolygon.
          feature.geometry.coordinates.forEach( // Then map each one?
              function(polygons) {
                  polygons.map(callback);
              });
          break;
      case "Polygon":
          feature.geometry.coordinates.map(callback);
  }
}

function findBoundaries(geojsonData) {

  geojsonData.features.forEach(function(feature) {
    iterateFeatures(feature, compareBounds);
  });
  return bounds;

  function compareBounds(polygon) {
    polygon.map(function(position) {
      if (bounds.x && bounds.y) { // If there is an x and y position...
        bounds.x.max = position[0] > bounds.x.max ? position[0] : bounds.x.max; // Set bounds.x.max to equal position[0] if position[0] is less than bounds.x.max, else sets as current.
        bounds.x.min = position[0] < bounds.x.min ? position[0] : bounds.x.min; // Set minimum bounds of x.
        bounds.y.max = position[1] > bounds.y.max ? position[1] : bounds.y.max;
        bounds.y.min = position[1] < bounds.y.min ? position[1] : bounds.y.min;
      } else { // Empty positions...
        bounds.x = {};
        bounds.y = {};
        bounds.x.max = bounds.x.min = position[0];
        bounds.y.max = bounds.y.min = position[1];
        }
      });
  }
}

function scaleCoordsToCanvas(canvas, geojsonData) {
  // Eventually need to use getBoundingClientRect() to observe the boundaries of an existing canvas object.
  var dimensions = {x: 1000, y: 1000};
      dataBounds = findBoundaries(geojsonData)
  console.log(dataBounds);
  var range = { x: (dataBounds.x.max - dataBounds.x.min),
                y: (dataBounds.y.max - dataBounds.y.min) }
  var ratio = { x: range.x / dimensions.x, y: (range.y / dimensions.y) };
  ratio.max = ratio.x > ratio.y ? ratio.x : ratio.y
  var center = { x: (dimensions.x - range.x / ratio.max ) / 2, y: (dimensions.y - range.y / ratio.max) / 2 };

  geojsonData.features.forEach(function(feature) {
    iterateFeatures(feature, transformPositions);
  });

  return geojsonData;

  function transformPositions(polygon) {
			polygon.map(
				function(position) {
					position[0] = (position[0] - dataBounds.x.min) / range.x * (range.x / ratio.max) + center.x;
					position[1] = (1 - (position[1] - dataBounds.y.min) / range.y) * (range.y / ratio.max) + center.y;
				});
		}
}

function drawFeature(canvas, feature) {
  var ctx = canvas.getContext("2d")
      ctx.fillStyle = renderOptions.fillColor
		  ctx.strokeStyle = renderOptions.strokeColor
		  ctx.lineWidth = renderOptions.strokeWidth;

  iterateFeatures(feature, renderPoly);

  function renderPoly(poly) {
    ctx.beginPath();
    poly.forEach(function(position, idx) {
      if (idx) {
        ctx.lineTo(position[0], position[1]);
      } else {
        ctx.moveTo(position[0], position[1]);
      }
    });
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
  }
}

function drawMap(canvas, geojsonData) {
  var reformattedData = scaleCoordsToCanvas(canvas, geojsonData);
  reformattedData.features.forEach(function(feature) {
    drawFeature(canvas, feature);
  });
}

function pipeCanvas(canvas, filename='map') {
    var output = fs.createWriteStream(path.join(__dirname, '..', '..', `${filename}.png`))
      stream = canvas.createPNGStream();

    stream.on('data', function(chunk) {
      output.write(chunk);
    });
}

/*const convertTools = require('./convert.js');

function drawRoute(canvasObject, routeArray, colour) {
  // Port to clientside js, scale in node then send via server to the frontend.
  var ctx = canvasObject.getContext("2d")
      width = canvasObject.width
      height = canvasObject.height;
  ctx.strokeStyle = colour;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = '4';


  convertTools.scaleBounds(width, height, routeArray)
  .then(function(scaledRouteArray) {
    // Draw.
    ctx.beginPath();
    for (i=0; i<scaledRouteArray.length;i++) {
      ctx.lineTo(scaledRouteArray[0], scaledRouteArray[1]);
      ctx.stroke();
    }
  }).catch(function(error) { console.error(error); })
}*/


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


/* */

const u = require('../../../json_stuff/user9.json')
      r1 = require('../../../json_stuff/corner.json')
      r2 = require('../../../json_stuff/triangle.json')
      r3 = require('../../../json_stuff/circle.json')
      r4 = require('../../../json_stuff/route1.json')
      r5 = require('../../../json_stuff/route2.json')
      r6 = require('../../../json_stuff/route3.json');

function d() {
  // For each user: for each route: colour per mapping.
  const unpackedData = u.mappings;
  const colours = {default: '#000000', "0": '#DF0101', "1": '#FFFF00',
  "2": '#40FF00', "3": '#00BFFF'};
  var c = Canvas.createCanvas(800, 800);
  canvas_context = c.getContext("2d");
  canvas_context.fillStyle = '#FFFFFF';
  canvas_context.lineWidth = 5;

  for (i = 0; i < 5; i++) {
     try {
       if ( i == 0 ) {
       canvas_context.strokeStyle = colours.default;
       var data = r6;
       // Draw defalt.
     } else {
       canvas_context.strokeStyle = colours[i-1];
       var dataPre = unpackedData[i];
       var data = dataPre.patterns['6'].coords;
     }
     canvas_context.beginPath();
     canvas_context.moveTo(data.x[0], data.y[0]);
     data.x.shift();
     data.y.shift();
     for (n=0; n<data.x.length; n++) {
       canvas_context.lineTo(data.x[n], data.y[n]);
       canvas_context.stroke();
     }
   } catch(e) {

   }
 }
   var output = fs.createWriteStream(path.join(__dirname, '..', '..', '..', 'json_stuff', `file6.png`))
     stream = c.createPNGStream();
   stream.on('data', function(chunk) {
     output.write(chunk);
   });
   stream.on('end', function(){
     console.log('saved png');
   });
}

d();
/*  var real_lines = [r1, r2, r3, r4, r5, r6];
  var guess_lines = [u1, u2, u3, u4, u5, u6, u7, u8];
  const mainColour = '#000000';
  const colours = ['#DF0101', '#FFFF00', '#40FF00', '#00BFFF',
                   '#0000FF', '#8000FF', '#FF00FF', '#DF7401'];

  for (n = 0; n<real_lines.length; n++) { // For each playback file.
    console.log('Colour is:', mainColour);
    var element = real_lines[n];
    var c = Canvas.createCanvas(800, 800);
    canvas_context = c.getContext("2d");
    canvas_context.fillStyle = '#FFFFFF';
    canvas_context.strokeStyle = mainColour;
    canvas_context.lineWidth = 5;
    // init canvas.

    canvas_context.beginPath();
    canvas_context.moveTo(element.x[0], element.y[0]);
    element.x.shift();
    element.y.shift();
    console.log(element

    for (i=0; i<element.x.length; i++) {
      canvas_context.lineTo(element.x[i], element.y[i]);
      canvas_context.stroke();
    } // Draw the intended line.

    for (m = 1; m < 5; m++) { // For each mapping...
      for (t = 0; t<guess_lines.length; t++) { // For each user
        canvas_context.strokeStyle = colours[t];
        console.log('Colour is:', colours[t]);

        var mapping = guess_lines[t].mappings[m];
        if ( mapping != null ) {
          var pattern = mapping.patterns[n+1];
          if ( pattern != null ) {
            var guessElement = pattern.coords;
            canvas_context.beginPath();
            canvas_context.moveTo(guessElement.x[0], guessElement.y[0]);
            guessElement.x.shift();
            guessElement.y.shift();
            for (i=0; i<guessElement.x.length; i++) {
              canvas_context.lineTo(guessElement.x[i], guessElement.y[i]);
              canvas_context.stroke();
            }
          } else {console.log(pattern); }
        } else {console.log(mapping); }
     // Draw the guess line.
      }
      var output = fs.createWriteStream(path.join(__dirname, '..', '..', '..', 'json_stuff', `file${n}mapping${m}.png`))
        stream = c.createPNGStream();
      stream.on('data', function(chunk) {
        output.write(chunk);
      });
      stream.on('end', function(){
        console.log('saved png');
      });
      // Pipe canvas for each mapping.
    }
  }
  }

  d();*/

module.exports = {
  build: function() { drawMap(canvas, convertJSON(mapData)); pipeCanvas(canvas); },
  boundaries: bounds
}
