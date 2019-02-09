const topojson = require('topojson')
  fs = require('fs')
  path = require('path')
  fetch = require('node-fetch')
  renderOptions = {
        			padding: 50,
        			fillColor: "#f8c59d",
        			strokeColor: "#bd6332",
        			strokeWidth: 1
        		};
var Canvas = require('canvas')
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
  var bounds = {};

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

function pipeCanvas(canvas) {
    var output = fs.createWriteStream(path.join(__dirname, '..', '..', 'map.png'))
      stream = canvas.createPNGStream();

    stream.on('data', function(chunk) {
      output.write(chunk);
    });
}

function drawRoute(canvas, coordinateArray, colour) {
  var canvasContext = canvas.getContext("2d"); // Diff between canvas and web audio contexts.
  // Add colour convert if necessary (regex check in switch => return formatted string).
  canvasContext.strokeStyle = colour;
  canvasContext.beginPath();
  canvasContext.moveTo(coordinateArray.x[0], coordinateArray.y[0]);

  for (i=0; i < coordinateArray.x.length; i++) {
    canvasContext.lineTo(coordinateArray.x[i], coordinateArray.y[i]);
    canvasContext.stroke();
  }
}

module.exports = {
  build: function() { drawMap(canvas, convertJSON(mapData)); pipeCanvas(canvas); },
  drawRoute: drawRoute
}
