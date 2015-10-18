var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var includePathSearcher = require('include-path-searcher');
var CachingWriter = require('broccoli-caching-writer');
var less = require('less');
var merge = require('lodash-node/modern/object/merge');
var RSVP = require('rsvp');
var writeFile = RSVP.denodeify(fs.writeFile);

module.exports = LessCompiler;

LessCompiler.prototype = Object.create(CachingWriter.prototype);
LessCompiler.prototype.constructor = LessCompiler;

function LessCompiler (sourceTrees, inputFile, outputFile, options) {
  if (!(this instanceof LessCompiler)) {
    return new LessCompiler(sourceTrees, inputFile, outputFile, options)
  }

  CachingWriter.apply(this, [arguments[0]].concat(arguments[3]));

  this.sourceTrees = sourceTrees;
  this.inputFile   = inputFile;
  this.outputFile  = outputFile;
  this.options     = options || {};
}

LessCompiler.prototype.updateCache = function (srcDir, destDir) {
  var destFile = destDir + '/' + this.outputFile;

  mkdirp.sync(path.dirname(destFile));

  var options = this.options;

  options.filename = includePathSearcher.findFileSync(this.inputFile, srcDir);

  options.paths = [path.dirname(options.filename)].concat(options.paths);

  if (options.sourceMap) {
    if (typeof options.sourceMap !== 'object') {
      options.sourceMap = {};
    }

    options.sourceMap.sourceMapURL = this.outputFile + '.map';
  }

  data = fs.readFileSync(options.filename, 'utf8');

  return less.render(data, options).
    catch(function(err) {
      less.writeError(err, options);
      throw err;
    }).
    then(function (output) {
      var fileWriterPromises = [writeFile(destFile, output.css, { encoding: 'utf8' }) ];
      var sourceMapURL = options.sourceMap && options.sourceMap.sourceMapURL;

      if (sourceMapURL) {
        fileWriterPromises.push(writeFile(destDir + '/' + sourceMapURL, output.map, { encoding: 'utf8' }));
      }

      return RSVP.Promise.all(fileWriterPromises);
    })
}