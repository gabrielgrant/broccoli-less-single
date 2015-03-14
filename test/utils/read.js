var fs = require('fs');

module.exports = function (inputPath) {
  return fs.readFileSync(inputPath, 'utf8').trim();
}
