import Promise from 'bluebird';
import _ from 'lodash';
import Cacheman from 'cacheman';

/**
 * Cacheman-promise constructor.
 *
 * @param {String} name
 * @param {Object} options
 * @api public
 */

export default class CachemanPromise {

  /**
   * Class constructor method.
   *
   * @param {String} name
   * @param {Object} [options]
   * @return {Cacheman} this
   * @api public
   */

  constructor(name, options = {}) {

    if (name && _.isObject(name)) {
      options = name;
      name = null;
    }

    this.cache = new Cacheman(name, options);
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
  wrap = (key, data, ttl, cb) => {
    let isCached = false;

    if (typeof ttl === 'function') {
      cb = ttl;
      ttl = null;
    }

    return new Promise((resolve, reject) => {
      this.cache.get(key, (error, val) => {

        if (error) {
          return reject(error);
        }

        return resolve(val);
      });
    }).then((val) => {

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
    }).then((val) => {

      // set cache if missing cache.
      if (!isCached) {
        this.set(key, val, ttl);
      }

      return (cb && _.isFunction(cb)) ? cb(val) : val;
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
  _get = (key, cb) => {

    return new Promise((resolve, reject) => {
      this.cache.get(key, (error, val) => {

        if (error) {
          return reject(error);
        }

        return resolve(val);
      });
    }).then((val) => {

      return (cb && _.isFunction(cb)) ? cb(val) : val;
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
  get = (key, cb) => {

    if (_.isArray(key)) {
      let item = {};
      _.forEach(key, (value) => {
        item[value] = this._get(value);
      });

      return Promise.props(item);
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
  set = (key, data, ttl, cb) => {

    if (typeof ttl === 'function') {
      cb = ttl;
      ttl = null;
    }

    return new Promise((resolve, reject) => {
      this.cache.set(key, data, ttl, (error, val) => {
        if (error) {
          return reject(error);
        }

        return resolve(val);
      });
    }).then((val) => {

      return (cb && _.isFunction(cb)) ? cb(val) : val;
    });
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
  pull = (key, data) => {
    // check default value is undefined or Null
    if (_.isUndefined(data)) {
      data = null;
    }

    return new Promise((resolve, reject) => {
      this.cache.get(key, (error, val) => {

        if (error) {
          return reject(error);
        }

        return resolve(val);
      });
    }).then((val) => {

      // delete cache key
      this.del(key);

      return (!_.isUndefined(val) && !_.isNull(val)) ? val : data;
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
  del = (key, cb) => {

    if (_.isString(key)) {
      key = [key];
    }

    return new Promise.resolve(key)
      .map((row) => {
        return new Promise((resolve, reject) => {
          this.cache.del(row, (err, data) => {

            if (err) {
              return reject(err);
            }

            return resolve(data);
          });
        });
      }).then(function() {
        return (cb && _.isFunction(cb)) ? cb() : '';
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
  clear = (cb) => {

    return new Promise((resolve, reject) => {
      this.cache.clear((error) => {

        if (error) {
          return reject(error);
        }

        return resolve();
      });
    }).then(function() {

      return (cb && _.isFunction(cb)) ? cb() : '';
    });
  }
}
