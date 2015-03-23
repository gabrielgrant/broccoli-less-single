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

function writeSourcemapFile(destFile, mapContent, mapOptions, callback) {
  var filename = destFile.replace('.css', '.map');

  if (mapOptions.hasOwnProperty('sourceMapURL')) {
    outputDir = path.dirname(destFile);
    filename = path.basename(mapOptions.sourceMapURL);
    filename = path.join(outputDir, filename);
  }

  fs.writeFile(filename, mapContent, { encoding: 'utf8' }, callback);
}


function LessCompiler (sourceTrees, inputFile, outputFile, options) {
  if (!(this instanceof LessCompiler)) {
    return new LessCompiler(sourceTrees, inputFile, outputFile, options)
  }

  CachingWriter.apply(this, [arguments[0]].concat(arguments[3]))

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

  return new RSVP.Promise(function(resolve, reject) {

    less.render(data, lessOptions)
      .then(function (output) {

	  function fileCallback (err) {
	    if (err) {
	      return reject(err);
	    }

	    return resolve(output);
	  }

    fs.writeFile(destFile, output.css, { encoding: 'utf8' }, fileCallback);

	  if (lessOptions.hasOwnProperty('sourceMap')) {
	    writeSourcemapFile(destFile, output.map, lessOptions.sourceMap, fileCallback);
	  }

      }, function (err) {
        less.writeError(err, lessOptions);
        reject(err);
      });

  });
}
