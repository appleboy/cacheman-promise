'use strict';

/**
 * Module dependencies.
 */

var Promise = require('bluebird');
var _ = require('lodash');
var Cacheman = require('cacheman');

module.exports = function(name, options) {

  if (name && _.isObject(name)) {
    options = name;
    name = null;
  }

  var cache = new Cacheman(name, options);

  return {
    self: cache,

    use: function() {
      return cache.use.apply(cache, arguments);
    },

    cache: function() {
      return cache.cache.apply(cache, arguments);
    },

    /**
     * Wraps a function in cache. I.e., the first time the function is run,
     * its results are stored in cache so subsequent calls retrieve from cache
     * instead of calling the function.
     *
     * @param {String} key
     * @param {Function || String} data
     * @param {Number} ttl
     * @param {Function} cb
     *
     * @return promise
     * @api public
     */
    wrap: function(key, data, ttl, cb) {
      var isCached = false;
      var _this = this;

      if (typeof ttl === 'function') {
        cb = ttl;
        ttl = null;
      }

      return new Promise(function(resolve, reject) {
        cache.get(key, function(error, val) {

          if (error) {
            return reject(error);
          }

          return resolve(val);
        });
      }).then(function(val) {

        // return cache value.
        if (!_.isUndefined(val) && !_.isNull(val)) {
          isCached = true;
          return val;
        }

        // return default value.
        if (_.isFunction(data)) {
          return data();
        }

        return data || null;
      }).then(function(val) {

        // set cache if missing cache.
        if (!isCached) {
          _this.set(key, val, ttl);
        }

        return (cb && _.isFunction(cb)) ? cb(val) : val;
      });
    },

    /**
     * Get an entry.
     *
     * @param {String|Array} key
     * @param {Function} cb
     * @return promise
     *
     * @api private
     */
    _get: function(key, cb) {

      return new Promise(function(resolve, reject) {
        cache.get(key, function(error, val) {

          if (error) {
            return reject(error);
          }

          return resolve(val);
        });
      }).then(function(val) {

        return (cb && _.isFunction(cb)) ? cb(val) : val;
      });
    },

    /**
     * Get multiple or single entry.
     *
     * @param {String|Array} key
     * @param {Function} cb
     * @return promise
     *
     * @api public
     */
    get: function(key, cb) {

      if (_.isArray(key)) {
        var _this = this;
        var item = {};
        _.forEach(key, function(value) {
          item[value] = _this._get(value);
        });

        return Promise.props(item);
      }

      return this._get(key, cb);
    },

    /**
     * Set an entry.
     *
     * @param {String} key
     * @param {Mixed} data
     * @param {Number} ttl
     * @param {Function} cb
     *
     * @return promise
     * @api public
     */
    set: function(key, data, ttl, cb) {

      if (typeof ttl === 'function') {
        cb = ttl;
        ttl = null;
      }

      return new Promise(function(resolve, reject) {
        cache.set(key, data, ttl, function(error, val) {

          if (error) {
            return reject(error);
          }

          return resolve(val);
        });
      }).then(function(val) {

        return (cb && _.isFunction(cb)) ? cb(val) : val;
      });
    },

    /**
     * Set an entry.
     *
     * @param {String} key
     * @param {Mixed} data
     * @param {Number} ttl
     * @param {Function} cb
     *
     * @return promise
     * @api public
     */
    pull: function(key, data) {
      var _this = this;

      // check default value is undefined or Null
      if (_.isUndefined(data)) {
        data = null;
      }

      return new Promise(function(resolve, reject) {
        cache.get(key, function(error, val) {

          if (error) {
            return reject(error);
          }

          return resolve(val);
        });
      }).then(function(val) {

        // delete cache key
        _this.del(key);

        return (!_.isUndefined(val) && !_.isNull(val)) ? val : data;
      });
    },

    /**
     * Delete an entry.
     *
     * @param {String|Array} key
     * @param {Function} cb
     *
     * @return promise
     * @api public
     */
    del: function(key, cb) {

      if (_.isString(key)) {
        key = [key];
      }

      return new Promise.resolve(key)
        .map(function(row) {
          return new Promise(function(resolve, reject) {
            cache.del(row, function(err, data) {

              if (err) {
                return reject(err);
              }

              return resolve();
            });
          });
        }).then(function() {
          return (cb && _.isFunction(cb)) ? cb() : '';
        });
    },

    /**
     * Clear all entries.
     *
     * @param {Function} cb
     *
     * @return promise
     * @api public
     */
    clear: function(cb) {

      return new Promise(function(resolve, reject) {
        cache.clear(function(error) {

          if (error) {
            return reject(error);
          }

          return resolve();
        });
      }).then(function() {

        return (cb && _.isFunction(cb)) ? cb() : '';
      });
    }
  };
};
