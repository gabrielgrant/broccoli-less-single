var fs = require('fs')
var path = require('path')
var mkdirp = require('mkdirp')
var includePathSearcher = require('include-path-searcher')
var CachingWriter = require('broccoli-caching-writer')
var less = require('less')
var _ = require('lodash')
var RSVP = require('rsvp');

module.exports = LessCompiler;
LessCompiler.prototype = Object.create(CachingWriter.prototype)
LessCompiler.prototype.constructor = LessCompiler

function LessCompiler (sourceTrees, inputFile, outputFile, options) {
  if (!(this instanceof LessCompiler)) {
    return new LessCompiler(sourceTrees, inputFile, outputFile, options)
  }

  CachingWriter.apply(this, arguments)

  this.sourceTrees = sourceTrees
  this.inputFile = inputFile
  this.outputFile = outputFile
  this.lessOptions = options || {}
}

LessCompiler.prototype.updateCache = function (srcDir, destDir) {
  var destFile = destDir + '/' + this.outputFile

  mkdirp.sync(path.dirname(destFile));

  var lessOptions = {
    filename: includePathSearcher.findFileSync(this.inputFile, srcDir),
    paths: srcDir
  }

  _.merge(lessOptions, this.lessOptions)
  lessOptions.paths = [path.dirname(lessOptions.filename)].concat(lessOptions.paths);
  data = fs.readFileSync(lessOptions.filename, 'utf8');

  var parser = new(less.Parser)(lessOptions);

  return new RSVP.Promise(function(resolve, reject) {
    parser.parse(data, function (err, tree) {
      if (err) {
        less.writeError(err, lessOptions);
        reject(err);
      }

      var css = tree.toCSS(lessOptions);
      fs.writeFileSync(destFile, css, { encoding: 'utf8' });

      resolve();
    });
  });
}
