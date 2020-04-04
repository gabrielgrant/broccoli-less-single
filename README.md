# broccoli-less-single
[![npm Version][npm-badge]][npm]
[![Build Status][travis-badge]][travis]

The broccoli-less-single plugin compiles `.less` files with
[less.js](https://github.com/less/less.js).

This plugin is designed to compile a single, primary input file
into a single output file, with a node of `@import`d dependencies. This
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
const compileLess = require('broccoli-less-single');

const outputNode = compileLess(inputNodes, inputFile, outputFile, options)
```

* **`inputNodes`**: An array of nodes that act as the include paths for
  less. If you have a single node, pass `[node]`.

* **`inputFile`**: Relative path of the main `.less` file to compile. This
  file must exist in one of the `inputNodes`.

* **`outputFile`**: Relative path of the output CSS file.

* **`options`**: A hash of options for less + caching options.

### Example

```js
var appCss = compileLess(sourceNodes, 'myapp/app.less', 'assets/app.css')
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
const Funnel      = require('broccoli-funnel');
const compileLess = require('broccoli-less-single');
const mergeTrees  = require('broccoli-merge-trees');

const appTree = funnel('app');
const lessTree = compileLess(appTree, 'styles/app.less', 'assets/app.css', {
  paths: ['.', 'bower_components/bootstrap/less'],
  // Note: if you want to cache to avoid possibly expensive rebuilds
  cacheInclude: [/.*\.(css|less)$/],
  cacheExclude: [],
});

module.exports = mergeTrees([appTree, lessTree]);
```
[npm]: https://www.npmjs.org/package/broccoli-less-single
[npm-badge]: https://img.shields.io/npm/v/broccoli-less-single.svg?style=flat-square
[travis]: https://travis-ci.org/gabrielgrant/broccoli-less-single
[travis-badge]: https://img.shields.io/travis/gabrielgrant/broccoli-less-single.svg?branch=master&style=flat-square
