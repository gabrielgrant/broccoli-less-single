# broccoli-less-single

The broccoli-less-single plugin compiles `.less` files with
[less.js](https://github.com/less/less.js).

This plugin is designed to compile a single, primary input file
into a single output file, with a tree of `@import`d dependencies. This
differs from [broccoli-less](https://github.com/sindresorhus/broccoli-less/),
which compiles each `.less` file individually into a `.css` file and doesn't
support `@import`s or a single output file depending on multiple inputs.

This code is based heavily on
[broccoli-sass](https://github.com/joliss/broccoli-sass/)

## Installation

```bash
npm install --save-dev broccoli-less-single
```

## Usage

```js
var compileLess = require('broccoli-less-single');

var outputTree = compileLess(inputTrees, inputFile, outputFile, options)
```

* **`inputTrees`**: An array of trees that act as the include paths for
  less. If you have a single tree, pass `[tree]`.

* **`inputFile`**: Relative path of the main `.less` file to compile. This
  file must exist in one of the `inputTrees`.

* **`outputFile`**: Relative path of the output CSS file.

* **`options`**: A hash of options for less.

### Example

```js
var appCss = compileLess(sourceTrees, 'myapp/app.less', 'assets/app.css')
```

### `@import`-Example

```css
/* file: sub.less */
h1 {
  font-size: 200em;
}

/* =================== */

/* file: app.less */
@import "sub.less";

html, body {
  margin: 20px;
}
```

### Bootstrap-Example

A sample project using bootstrap and broccoli-less-single can be found [here.](https://github.com/jasonmit/broccoli-less-single-example)

```js
// Brocfile.js
var pickFiles   = require('broccoli-static-compiler');
var compileLess = require('broccoli-less-single');
var mergeTrees  = require('broccoli-merge-trees');

var app = pickFiles('app', {
	srcDir:  '/',
	destDir: '/'
});

var less = compileLess(app, 'styles/app.less', 'assets/app.css', {
	paths: ['.', 'bower_components/bootstrap/less']
})

module.exports = mergeTrees([app, less]);
```
