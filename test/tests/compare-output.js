var path = require('path');
var read = require('../utils/read')
var lessCompile = require('../utils/build');
var expected = path.join(__dirname, '..', 'expected');

function compare (name, lessOptions) {
  return lessCompile('../less', name + '.less', name + '.css', lessOptions).then(function (result) {
    assert.equal(result.css, read(path.join(expected, result.outputFile)));
  });
}

describe('lessCompiler', function () {
  it('basic less preprocessing', function () {
    return compare('basic');
  });

  it('import statements functioning', function () {
    return compare('import');
  });

  it('`lessOption` discovers paths', function () {
    return compare('paths', {
      paths: ['../less/branch']
    });
  });
});
