'use strict';

process.chdir(__dirname);

var path = require('path');
var broccoli = require('broccoli');

var compileLess = require('../../index');
var read = require('./read');

module.exports = function (inputNodes, inputFile, outputFile, lessOptions) {
  inputNodes = !Array.isArray(inputNodes) ? [inputNodes] : inputNodes;

  var less = compileLess.apply(this, arguments),
    builder = new broccoli.Builder(less);

  return builder.build().then(function () {
    return {
      css: read(path.join(builder.outputPath, outputFile)),
      directory: builder.outputPath,
      outputFile: outputFile
    };
  });
}
