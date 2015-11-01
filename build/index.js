'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _lodash = require('lodash');

var _cacheman = require('cacheman');

var _cacheman2 = _interopRequireDefault(_cacheman);

/**
 * Cacheman-promise constructor.
 *
 * @param {String} name
 * @param {Object} options
 * @api public
 */

var CachemanPromise = (function () {

  /**
   * Class constructor method.
   *
   * @param {String} name
   * @param {Object} [options]
   * @return {Cacheman} this
   * @api public
   */

  function CachemanPromise(name) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, CachemanPromise);

    if (name && (0, _lodash.isObject)(name)) {
      options = name;
      name = null;
    }

    this.cache = new _cacheman2['default'](name, options);
  }

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

  _createClass(CachemanPromise, [{
    key: 'wrap',
    value: function wrap(key, data, ttl, cb) {
      var _this = this;

      var isCached = false;

      if (typeof ttl === 'function') {
        cb = ttl;
        ttl = null;
      }

      return new _bluebird2['default'](function (resolve, reject) {
        _this.cache.get(key, function (error, val) {
          if (error) {
            return reject(error);
          }

          return resolve(val);
        });
      }).then(function (val) {
        // return cache value.
        if (!(0, _lodash.isUndefined)(val) && !(0, _lodash.isNull)(val)) {
          isCached = true;
          return val;
        }

        // return default value.
        if ((0, _lodash.isFunction)(data)) {
          return data();
        }

        return data || null;
      }).then(function (val) {
        // set cache if missing cache.
        if (!isCached) {
          _this.set(key, val, ttl);
        }

        return cb && (0, _lodash.isFunction)(cb) ? cb(val) : val;
      });
    }

    /**
     * Get an entry.
     *
     * @param {String|Array} key
     * @param {Function} cb
     * @return promise
     *
     * @api private
     */

  }, {
    key: '_get',
    value: function _get(key, cb) {
      var _this2 = this;

      return new _bluebird2['default'](function (resolve, reject) {
        _this2.cache.get(key, function (error, val) {
          if (error) {
            return reject(error);
          }

          return resolve(val);
        });
      }).then(function (val) {
        return cb && (0, _lodash.isFunction)(cb) ? cb(val) : val;
      });
    }

    /**
     * Get multiple or single entry.
     *
     * @param {String|Array} key
     * @param {Function} cb
     * @return promise
     *
     * @api public
     */

  }, {
    key: 'get',
    value: function get(key, cb) {
      var _this3 = this;

      if ((0, _lodash.isArray)(key)) {
        var _ret = (function () {
          var item = {};
          (0, _lodash.forEach)(key, function (value) {
            item[value] = _this3._get(value);
          });

          return {
            v: _bluebird2['default'].props(item)
          };
        })();

        if (typeof _ret === 'object') return _ret.v;
      }

      return this._get(key, cb);
    }

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

  }, {
    key: 'set',
    value: function set(key, data, ttl, cb) {
      var _this4 = this;

      if (typeof ttl === 'function') {
        cb = ttl;
        ttl = null;
      }

      return new _bluebird2['default'](function (resolve, reject) {
        _this4.cache.set(key, data, ttl, function (error, val) {
          if (error) {
            return reject(error);
          }

          return resolve(val);
        });
      }).then(function (val) {
        return cb && (0, _lodash.isFunction)(cb) ? cb(val) : val;
      });
    }

    /**
     * Delete an entry after pull the data.
     *
     * @param {String} key
     * @param {Mixed} data
     *
     * @return promise
     * @api public
     */

  }, {
    key: 'pull',
    value: function pull(key) {
      var _this5 = this;

      var data = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

      return new _bluebird2['default'](function (resolve, reject) {
        _this5.cache.get(key, function (error, val) {
          if (error) {
            return reject(error);
          }

          return resolve(val);
        });
      }).then(function (val) {
        // delete cache key
        _this5.del(key);

        return !(0, _lodash.isUndefined)(val) && !(0, _lodash.isNull)(val) ? val : data;
      });
    }

    /**
     * Delete an entry.
     *
     * @param {String|Array} key
     * @param {Function} cb
     *
     * @return promise
     * @api public
     */

  }, {
    key: 'del',
    value: function del(key, cb) {
      var _this6 = this;

      if ((0, _lodash.isString)(key)) {
        key = [key];
      }

      return new _bluebird2['default'].resolve(key).map(function (row) {
        return new _bluebird2['default'](function (resolve, reject) {
          _this6.cache.del(row, function (err, data) {
            if (err) {
              return reject(err);
            }

            return resolve(data);
          });
        });
      }).then(function () {
        return cb && (0, _lodash.isFunction)(cb) ? cb() : '';
      });
    }

    /**
     * Clear all entries.
     *
     * @param {Function} cb
     *
     * @return promise
     * @api public
     */

  }, {
    key: 'clear',
    value: function clear(cb) {
      var _this7 = this;

      return new _bluebird2['default'](function (resolve, reject) {
        _this7.cache.clear(function (error) {
          if (error) {
            return reject(error);
          }

          return resolve();
        });
      }).then(function () {
        return cb && (0, _lodash.isFunction)(cb) ? cb() : '';
      });
    }
  }]);

  return CachemanPromise;
})();

exports['default'] = CachemanPromise;
module.exports = exports['default'];