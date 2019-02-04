var Canvas = require('canvas')
var fs = require('fs')
  path = require('path')
  geo = require('d3-geo')
  topojson = require('topojson-client')
  jsonMap = require('../json/NUTSBounds.json');

function drawMap() {
  var canvas = Canvas.createCanvas(960, 600);
  var ctx = canvas.getContext("2d");
  var geoPath = geo.geoPath().context(ctx);
  for (prop in  ctx) { console.log(prop); }
  console.log(ctx.beginPath);
  ctx.beginPath();
  geoPath(topojson.mesh(jsonMap));
  ctx.stroke();
  return canvas;
}

function pipeCanvas(canvas) {
  //canvas.pngStream().pipe(fs.createWriteStream(""))
  var output = fs.createWriteStream(path.join(__dirname, '..', '..', 'map.png'))
      stream = canvas.createPNGStream();

  stream.on('data', function(chunk) {
    output.write(chunk);
  });
}

module.exports = {
  draw: drawMap,
  pipe: pipeCanvas
}
