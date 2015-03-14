var path = require('path');
var read = require('../utils/read')
var lessCompile = require('../utils/build');
var expected = path.join(__dirname, '..', 'expected');

function compare (name, done, lessOptions) {
  lessCompile('../less', name + '.less', name + '.css', lessOptions).then(function (result) {
    assert.equal(result.css, read(path.join(expected, result.outputFile)));
    done();
  }).catch(done);
}

describe('lessCompiler', function () {
  it('basic less preprocessing', function (done) {
    compare('basic', done);
  });

  it('import statements functioning', function (done) {
    compare('import', done);
  });

  it('`lessOption` discovers paths', function (done) {
    compare('paths', done, {
      paths: ['../less/branch']
    });
  });
});
