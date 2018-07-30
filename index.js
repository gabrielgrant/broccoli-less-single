'use strict';

var CachingWriter = require('broccoli-caching-writer');

module.exports = LessCompiler;

LessCompiler.prototype = Object.create(CachingWriter.prototype);
LessCompiler.prototype.constructor = LessCompiler;

function uniq(value, index, arr) {
  return arr.indexOf(value) === index;
}

function LessCompiler(sourceNodes, inputFile, outputFile, _options) {
  if (!(this instanceof LessCompiler)) {
    return new LessCompiler(sourceNodes, inputFile, outputFile, _options);
  }

  CachingWriter.call(this, Array.isArray(sourceNodes) ? sourceNodes : [sourceNodes], _options);

  if (!outputFile) {
    outputFile = inputFile.replace(/\.less/i, '.css');
  }

  // clone the _options hash to prevent mutating what was
  // passed into us with fallback values. see issue #29
  var options = require('lodash.merge')({}, _options);

  if (options.sourceMap) {
    if (typeof options.sourceMap !== 'object') {
      options.sourceMap = {};
    }

    if (!options.sourceMap.sourceMapURL) {
      options.sourceMap.sourceMapURL = outputFile + '.map';
    }
  }

  this.lessOptions = options;
  this.sourceNodes = sourceNodes;
  this.inputFile = inputFile;
  this.outputFile = outputFile;
}

LessCompiler.prototype.build = function() {
  var fs = require('fs');
  var less = require('less');
  var path = require('path');
  var mkdirp = require('mkdirp');

  var destFile = this.outputPath + '/' + this.outputFile;

  mkdirp.sync(path.dirname(destFile));

  var lessOptions = {
    filename: require('include-path-searcher').findFileSync(this.inputFile, this.inputPaths),
    paths: []
  };

  require('lodash.merge')(lessOptions, this.lessOptions);

  lessOptions.paths = [path.dirname(lessOptions.filename)]
    .concat(this.inputPaths)
    .concat(lessOptions.paths)
    .filter(uniq);

  var data = fs.readFileSync(lessOptions.filename, 'utf8');

  return less
    .render(data, lessOptions)
    .catch(function(err) {
      if (!lessOptions || (lessOptions && !lessOptions.silent)) {
        console.error(err.toString(lessOptions));
      }

      throw err;
    })
    .then(
      function(output) {
        fs.writeFileSync(destFile, output.css, { encoding: 'utf8' });

        var sourceMapURL = lessOptions.sourceMap && lessOptions.sourceMap.sourceMapURL;

        if (sourceMapURL) {
          fs.writeFileSync(this.outputPath + '/' + sourceMapURL, output.map, {
            encoding: 'utf8'
          });
        }
      }.bind(this)
    );
};
