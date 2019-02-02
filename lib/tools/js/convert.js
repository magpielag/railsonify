function makeUpper(string_var) {
    return string_var.charAt(0).toUpperCase() + string.slice(1);
}

function parseTime(timeAsString) {
  var c = timeAsString.split(':');
  return parseInt(c[0]) * 60 + parseInt(c[1]);
}

module.exports = {
  makeUpper: makeUpper,
  parseTime: parseTime
}
