const mapBounds = {x: [149.5, 973.9], y: [54.1, 974.1]};
const scaling = {
  log: function(xOrY, inputValue, minValue, maxValue) {
    switch(xOrY) {
      case 'x':
      case 'X':
        var minScale = mapBounds.x[0], maxScale = mapBounds.x[1];
        break;

      case 'y':
      case 'Y':
        var minScale = mapBounds.y[0], maxScale = mapBounds.y[1];
        break;

      case 'F':
      case 'f':
        var minScale = 51.91, maxScale = 3322.44;
        break;
    }
    var scale = (Math.log(maxValue) - Math.log(minValue)) / (maxScale - minScale);
    return Math.exp(Math.log(minValue) + scale * (inputValue - minScale));
  },
  lin: function(xOrY, inputValue, minValue, maxValue) {
    switch(xOrY) {
      case 'x':
      case 'X':
        var minScale = mapBounds.x[0], maxScale = mapBounds.x[1];
        break;

      case 'y':
      case 'Y':
        var minScale = mapBounds.y[0], maxScale = mapBounds.y[1];
        break;
    }
    return (maxValue - minValue) * (inputValue - minScale) / (maxScale - minScale) + minValue;
  },
  closest: function (value, arr) {
    return arr.reduce(function (prev, curr) {
      return (Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev)
    });
  }
};
