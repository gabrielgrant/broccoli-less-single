var fs = require('fs')
var path = require('path')
var mkdirp = require('mkdirp')
var includePathSearcher = require('include-path-searcher')
var quickTemp = require('quick-temp')
var mapSeries = require('promise-map-series')
var less = require('less')
var _ = require('lodash')
var RSVP = require('rsvp');

module.exports = LessCompiler
function LessCompiler (sourceTrees, inputFile, outputFile, options) {
  if (!(this instanceof LessCompiler)) return new LessCompiler(sourceTrees, inputFile, outputFile, options)
  this.sourceTrees = sourceTrees
  this.inputFile = inputFile
  this.outputFile = outputFile
  options = options || {}
  this.lessOptions = {
    imagePath: options.imagePath,
    outputStyle: options.outputStyle,
    sourceComments: options.sourceComments,
    sourceMap: options.sourceMap
  }
}

LessCompiler.prototype.read = function (readTree) {
  var self = this
  quickTemp.makeOrRemake(this, '_tmpDestDir')
  var destFile = this._tmpDestDir + '/' + this.outputFile
  mkdirp.sync(path.dirname(destFile))
  return mapSeries(this.sourceTrees, readTree)
    .then(function (includePaths) {
      var lessOptions = {
        filename: includePathSearcher.findFileSync(self.inputFile, includePaths),
        paths: includePaths,
      }
      _.merge(lessOptions, self.lessOptions)
      options.paths = [path.dirname(options.filename)].concat(options.paths);
      data = fs.readFileSync(self.inputFile, 'utf8');

      var parser = new(less.Parser)(lessOptions);

      var promise = new RSVP.Promise(function(resolve, reject) {
        parser.parse(data, function (e, tree) {
          if (e) {
            less.writeError(e, options);
            reject(e);
          }
          var css = tree.toCSS(options);
          fs.writeFileSync(destFile, css, { encoding: 'utf8' });

          resolve(self._tmpDestDir);
        });
      });

      return promise;
    });
}

LessCompiler.prototype.cleanup = function () {
  quickTemp.remove(this, '_tmpDestDir')
}

