var fs = require('fs')
var path = require('path')
var mkdirp = require('mkdirp')
var includePathSearcher = require('include-path-searcher')
var CachingWriter = require('broccoli-caching-writer')
var less = require('less')
var merge = require('lodash.merge')
var RSVP = require('rsvp')
var writeFile = RSVP.denodeify(fs.writeFile)

module.exports = LessCompiler;

LessCompiler.prototype = Object.create(CachingWriter.prototype)
LessCompiler.prototype.constructor = LessCompiler

function LessCompiler (sourceTrees, inputFile, outputFile, options) {
  if (!(this instanceof LessCompiler)) {
    return new LessCompiler(sourceTrees, inputFile, outputFile, options)
  }
  
  var cacheOptions = merge({
    filterFromCache: {
      include: [/.*\.less$/]
    }
  }, options)

  CachingWriter.call(this, sourceTrees, cacheOptions)

  options = merge({}, options)

  if (options.sourceMap) {
    if (typeof options.sourceMap !== 'object') {
      options.sourceMap = {};
    }

    if (!options.sourceMap.sourceMapURL) {
      options.sourceMap.sourceMapURL = outputFile + '.map';
    }
  }

  this.sourceTrees = sourceTrees
  this.inputFile   = inputFile
  this.outputFile  = outputFile
  this.lessOptions = options
}

LessCompiler.prototype.updateCache = function (srcDir, destDir) {
  var destFile = destDir + '/' + this.outputFile

  mkdirp.sync(path.dirname(destFile))

  var lessOptions = {
    filename: includePathSearcher.findFileSync(this.inputFile, srcDir),
    paths: srcDir
  }

  merge(lessOptions, this.lessOptions)

  lessOptions.paths = [path.dirname(lessOptions.filename)].concat(lessOptions.paths);
  data = fs.readFileSync(lessOptions.filename, 'utf8');

  return less.render(data, lessOptions).
    catch(function(err) {
      less.writeError(err, lessOptions);
      throw err;
    }).
    then(function (output) {
      var fileWriterPromises = [writeFile(destFile, output.css, { encoding: 'utf8' }) ];
      var sourceMapURL = lessOptions.sourceMap && lessOptions.sourceMap.sourceMapURL;

      if (sourceMapURL) {
        fileWriterPromises.push( writeFile(destDir + '/' + sourceMapURL, output.map, { encoding: 'utf8' }) );
      }

      return RSVP.Promise.all(fileWriterPromises);
    })
}
