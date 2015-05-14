# Cacheman-Promise

[![NPM version][npm-image]][npm-url] [![Downloads][downloads-image]][npm-url] [![Build Status](https://travis-ci.org/appleboy/cacheman-promise.png?branch=master)](https://travis-ci.org/appleboy/cacheman-promise) [![Dependency Status](https://david-dm.org/appleboy/cacheman-promise.svg)](https://david-dm.org/appleboy/cacheman-promise)

[![NPM](https://nodei.co/npm/cacheman-promise.png?downloads=true&stars=true)](https://nodei.co/npm/cacheman-promise/)

[npm-url]: https://www.npmjs.org/package/cacheman-promise
[npm-image]: http://img.shields.io/npm/v/cacheman-promise.svg
[downloads-image]: http://img.shields.io/npm/dm/cacheman-promise.svg

> [Cacheman](https://github.com/cayasso/cacheman) library with a promise interface.

## Installation

```
$ npm install --save cacheman-promise
```

## Usage

Cacheman-promise only support `set`, `get`, `del`, `clear` and `wrap` promise interface.

### Cacheman([name, [options]])

Please refer to [Cacheman Options API](https://github.com/cayasso/cacheman/blob/master/README.md#cachemanname-options)

```javascript
var Cacheman = require('cacheman-promise');

var options = {
  ttl: 90,
  engine: 'redis',
  port: 9999,
  host: '127.0.0.1'
};

var cache = new Cacheman('todo', options);
// or
var cache = new Cacheman(options);
```

### cache.set(key, value, [ttl, [fn]])

Usage:

```javascript
var key = 'foo';
var data = 'bar';

cache.set(key, {name: data})
  .then(function(val){
    // output "{name: 'bar'}"
    console.log(val);
  });
```

### cache.get(key, fn)

Usage:

```javascript
cache.get('foo')
  .then(function(val){
    // output "{name: 'bar'}"
    console.log(val);
  });
```

### cache.del(key, [fn])

You can pass `array` or `string` as key.

Usage:

```javascript
cache.del('foo')
  .then(function(){
    console.log('foo was deleted');
  });
```

or

```javascript
cache.del(['foo', 'bar'])
  .then(function(){
    console.log('foo and bar was deleted');
  });
```

### cache.clear([fn])

```javascript
cache.clear()
  .then(function(){
    console.log('cache is now clear');
  });
```

### cache.wrap(key, default, [ttl, [fn]])

Wraps a function in cache. I.e., the first time the function is run, its results are stored in cache so subsequent calls retrieve from cache instead of calling the function.

```javascript
var key = 'foo';
var data = 'bar';

cache.wrap(key, data)
  .then(function(val) {

    // get foo key from cache
    return cache.get(key);
  }).then(function(val) {

    // output 'bar'
    console.log(val);
  });
```

## Run tests

```
$ npm test
```
