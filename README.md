# gasify [![NPM version][npm-image]][npm-url]  [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url]  [![Coverage percentage][coveralls-image]][coveralls-url] [![Greenkeeper badge](https://badges.greenkeeper.io/fossamagna/gasify.svg)](https://greenkeeper.io/)

[Browserify](http://browserify.org/) plugin for Google Apps Script.

## About

In Google Apps Script, it must be top level function declaration that entry point called from [google.script.run](https://developers.google.com/apps-script/guides/html/reference/run).
When `gasify` detect a function assignment expression to `global` object. it generate a top level function declaration statement.

## example

main.js:
```js
var echo = require('./echo');
global.echo = echo;
```

echo.js:
```
module.exports = function(message) {
  return message;
}
```

build:
```
$ browserify main.js -p gasify -o Code.gs
```

Code.gs
```js
var global = this;function echo() {
}(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = function(message) {
  return message;
};

},{}],2:[function(require,module,exports){
(function (global){
var echo = require('./echo');
global.echo = echo;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./echo":1}]},{},[2]);
```

## Installation

```sh
$ npm install gasify
```

## Usage

### CLI

```sh
$ browserify main.js -p gasify -o Code.gs
```

[npm-image]: https://badge.fury.io/js/gasify.svg
[npm-url]: https://npmjs.org/package/gasify
[travis-image]: https://travis-ci.org/fossamagna/gasify.svg?branch=master
[travis-url]: https://travis-ci.org/fossamagna/gasify
[daviddm-image]: https://david-dm.org/fossamagna/gasify.svg
[daviddm-url]: https://david-dm.org/fossamagna/gasify
[coveralls-image]: https://coveralls.io/repos/github/fossamagna/gasify/badge.svg?branch=master
[coveralls-url]: https://coveralls.io/github/fossamagna/gasify?branch=master
