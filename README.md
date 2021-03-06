# Cacheman-Promise

[![NPM version][npm-image]][npm-url] [![Downloads][downloads-image]][npm-url] [![Build Status](https://travis-ci.org/appleboy/cacheman-promise.png?branch=master)](https://travis-ci.org/appleboy/cacheman-promise) [![Dependency Status](https://david-dm.org/appleboy/cacheman-promise.svg)](https://david-dm.org/appleboy/cacheman-promise) [![Coverage Status](https://coveralls.io/repos/appleboy/cacheman-promise/badge.svg?branch=master&service=github)](https://coveralls.io/github/appleboy/cacheman-promise?branch=master)

[![NPM](https://nodei.co/npm/cacheman-promise.png?downloads=true&stars=true)](https://nodei.co/npm/cacheman-promise/)

[npm-url]: https://www.npmjs.org/package/cacheman-promise
[npm-image]: http://img.shields.io/npm/v/cacheman-promise.svg
[downloads-image]: http://img.shields.io/npm/dm/cacheman-promise.svg

[Cacheman](https://github.com/cayasso/cacheman) library with a promise interface.

## Installation

```
$ npm install --save cacheman-promise
```

## Usage

Cacheman-promise only support `set`, `get`, `del`, `clear`, `pull` and `wrap` promise interface.

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

You can pass `array` or `string` as key.

Usage:

```javascript

cache.set('foo', 'bar');

cache.get('foo')
  .then(function(val){
    // output "bar"
    console.log(val);
  });
```

pass `array` as multiple keys

Usage:

```javascript

cache.set('foo', 1);
cache.set('bar', 2);

cache.get(['foo', 'bar'])
  .then(function(result){
    // output {"foo": 1, "bar": 2}
    console.log(result);
  });
```

### cache.pull(key, default)

If you need to retrieve an item from the cache and then delete it, you may use the `pull` method. Like the `get` method, `null` will be returned if the item does not exist in the cache.

```javascript
cache.set('foo', 'bar');

cache.pull('foo')
  .then(function(result){
    // output 'bar'
    console.log(result);
  }).then(function() {
    return cache.get('foo');
  }).then(function(result) {
    // output 'null'
    console.log(result);
  });
```

You can pass default value as second paramaeter if the item doesn't exist in the cache.

```javascript
// make sure `foo` cache doesn't exist.
cache.del('foo');

cache.pull('foo', 'bar')
  .then(function(result){
    // output 'bar'
    console.log(result);
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

Clear some items with `prefix name`:

```javascript
cache.clear('foo*')
  .then(function(){
    console.log('clear cache with `foo` prefix name like `foo1`, `foo2` etc.');
  });
```

### cache.clear([fn])

Clear all cache as follwoing:

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
