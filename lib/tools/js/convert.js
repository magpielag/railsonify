var bounds = require('./canvas.js').boundaries;
if (Object.keys(bounds).length == 0) {
    bounds = { x: { min: -8.642594970884725, max: 1.7624989748001116 },
               y: { min: 49.883228910354326, max: 60.84378280019041 }
             };
  }

function makeUpper(string_var) {
    return string_var.charAt(0).toUpperCase() + string.slice(1);
}

function parseTime(timeAsString) {
  var c = timeAsString.split(':');
  return parseInt(c[0]) * 60 + parseInt(c[1]);
}

const scale = {log: function(v, minv, maxv, minp, maxp) {
  var scaled = (Math.log(maxv) - Math.log(minv)) / (maxp - minp);
  return Math.exp(Math.log(minv) + scaled * (v - minp));
  },
  lin: function(v, minv, maxv, minp, maxp) {
    return (maxv - minv) * (v - minp) / (maxp - minp) + minv;
  }
};

function scaleBoundaries(canWidth, canHeight, data) {
  // Copy of canvas drawing function, converts lonlat to pixel position.
  // Takes an md array of data, then returns the converted array.
  var dimensions = {x: canWidth, y: canHeight};
  var range = { x: (bounds.x.max - bounds.x.min),
                y: (bounds.y.max - bounds.y.min) }
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

console.log(scaleCoordsToCanvas(1000, 1000, [[-5.70966, 50.06783],[-3.0689, 58.6373]]));


module.exports = {
  makeUpper: makeUpper,
  scaleBounds: scaleBoundaries,
  parseTime: parseTime
}

/*

const scaling = {
  logscale: function(value, minval, maxval, minpos, maxpos) {
    var scale = (Math.log(maxval) - Math.log(minval)) / (maxpos - minpos)
    return Math.exp(Math.log(minval) + scale * (value - minpos))
  },
  scale: function (unscaledNum, minAllowed, maxAllowed, min, max) {
    return (maxAllowed - minAllowed) * (unscaledNum - min) / (max - min) + minAllowed
  },
  closest: function (value) {
    return notes.reduce(function (prev, curr) {
      return (Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev)
    })
  }
*/
