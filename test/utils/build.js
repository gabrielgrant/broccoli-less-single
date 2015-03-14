'use strict';

process.chdir(__dirname);

var RSVP = require('rsvp');
var path = require('path');
var broccoli = require('broccoli');

var compileLess = require('../../index');
var read = require('./read');

module.exports = function (inputTrees, inputFile, outputFile, lessOptions) {
  inputTrees = !Array.isArray(inputTrees) ? [inputTrees] : inputTrees;

  var less = compileLess.apply(this, arguments);

  return new RSVP.Promise(function (resolve, reject) {
    return new broccoli.Builder(less).build().then(function (results) {
      resolve({
        css: read(path.join(results.directory, outputFile)),
        directory: results.directory,
        outputFile: outputFile
      });
    });
  });
}
