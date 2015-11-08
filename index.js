'use strict';

var fs = require('fs');
var path = require('path');
var less = require('less');
var mkdirp = require('mkdirp');
var merge = require('lodash.merge');
var CachingWriter = require('broccoli-caching-writer');
var includePathSearcher = require('include-path-searcher');

module.exports = LessCompiler;

LessCompiler.prototype = Object.create(CachingWriter.prototype)
LessCompiler.prototype.constructor = LessCompiler

function LessCompiler(sourceTrees, inputFile, outputFile, _options) {
  if (!(this instanceof LessCompiler)) {
    return new LessCompiler(sourceTrees, inputFile, outputFile, _options);
  }

  CachingWriter.call(this, Array.isArray(sourceTrees) ? sourceTrees : [sourceTrees], _options);

  // clone the _options hash to prevent mutating what was
  // passed into us with fallback values. see issue #29
  var options = merge({}, _options);

  if (options.sourceMap) {
    if (typeof options.sourceMap !== 'object') {
      options.sourceMap = {};
    }

    if (!options.sourceMap.sourceMapURL) {
      options.sourceMap.sourceMapURL = outputFile + '.map';
    }
  }

  this.lessOptions = options;
  this.sourceTrees = sourceTrees;
  this.inputFile   = inputFile;
  this.outputFile  = outputFile;
}

LessCompiler.prototype.build = function() {
  var destFile = this.outputPath + '/' + this.outputFile;

  mkdirp.sync(path.dirname(destFile));

  var lessOptions = {
    filename: includePathSearcher.findFileSync(this.inputFile, this.inputPaths),
    paths: this.inputPaths.slice()
  };

  this.inputPaths = lessOptions.paths.slice();

  merge(lessOptions, this.lessOptions);

  lessOptions.paths = [path.dirname(lessOptions.filename)].concat(lessOptions.paths);

  var data = fs.readFileSync(lessOptions.filename, 'utf8');

  return less.render(data, lessOptions).
    catch(function(err) {
      less.writeError(err, lessOptions);
      throw err;
    }).
    then(function (output) {
      fs.writeFileSync(destFile, output.css, {
        encoding: 'utf8'
      });

      var sourceMapURL = lessOptions.sourceMap && lessOptions.sourceMap.sourceMapURL;

      if (sourceMapURL) {
        fs.writeFileSync(this.outputPath + '/' + sourceMapURL, output.map, {
          encoding: 'utf8'
        });
      }
    }.bind(this));
};
