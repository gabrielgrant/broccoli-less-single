var compileLess = require('./index');
var less = compileLess(['tests/less'], 'app.less', 'app.css');

module.exports = less;
