'use strict';

var should = require('should');
var faker = require('faker');
var Promise = require('bluebird');
var Cacheman = require('../lib');

describe('Cache Engine test:', function() {
  var cache;

  before(function(done) {
    cache = new Cacheman('testing');
    done();
  });

  afterEach(function(done) {
    cache.clear();
    done();
  });

  it('should have main methods', function() {
    cache.set.should.be.ok;
    cache.get.should.be.ok;
    cache.del.should.be.ok;
    cache.clear.should.be.ok;
    cache.wrap.should.be.ok;
    cache.cache.should.be.ok;
    cache.use.should.be.ok;
  });

  it('should store items', function(done) {
    cache.set('test1', { a: 1 }, function(val) {

      cache.get('test1', function(val) {

        val.a.should.be.eql(1);
        done();
      });
    });
  });

  it('should store zero', function(done) {
    cache.set('test2', 0, function(val) {

      cache.get('test2', function(val) {

        val.should.be.eql(0);
        done();
      });
    });
  });

  it('should store false', function(done) {
    cache.set('test3', false, function(val) {

      cache.get('test3', function(val) {
        val.should.be.false;
        done();
      });
    });
  });

  it('should store null', function(done) {
    cache.set('test4', null, function(val) {

      cache.get('test4', function(val) {
        should.not.exist(val);
        done();
      });
    });
  });

  it('should cache items', function(done) {
    var value = Date.now()
    var key = "k" + Date.now();
    cache.cache(key, value, 10, function(err, data) {
      data.should.be.eql(value);
      done();
    });
  });

  it('should allow middleware when using `cache` method', function(done) {

    this.timeout(0);
    var value = Date.now(), key = "k" + Date.now();

    function middleware() {
      return function(key, data, ttl, next) {
        next();
      };
    }

    cache.use(middleware());
    cache.cache(key, value, 1, function(err, data) {
      data.should.be.eql(value);
      done();
    });
  });

  it('should cache false', function(done) {
    var key = "k" + Date.now();
    cache.cache(key, false, function(err, data) {
      data.should.be.false;
      done();
    });
  });

  it('should cache null', function(done) {
    var key = "k" + Date.now();
    cache.cache(key, null, 10, function(err, data) {
      should.not.exist(data);
      done();
    });
  });

  it('should cache zero', function(done) {
    var key = "k" + Date.now();

    cache.cache(key, 0, function(err, data) {
      data.should.be.eql(0);
      done();
    });
  });

  it('should allow middleware to overwrite caching values', function(done) {
    var value = Date.now(), key = "k" + Date.now();

    function middleware() {
      return function(key, data, ttl, next) {
        next(null, 'data', 1);
      };
    }

    cache.use(middleware());
    cache.cache(key, value, 1, function(err, data) {
      data.should.be.eql('data');
      done();
    });
  });

  it('should allow middleware to accept errors', function(done) {

    var value = Date.now(), key = "k" + Date.now(), error = new Error('not');

    function middleware() {
      return function(key, data, ttl, next) {
        next(error);
      };
    }

    cache.use(middleware());

    cache.cache(key, value, 1, function(err, data) {
      if (1 === arguments.length && err) {
        err.should.be.eql(error);
        done();
      }
    });
  });

  it('get empty cache value if cache not found and no default value', function(done) {
    var key = faker.name.findName();

    cache.wrap(key)
      .then(function(val) {
        should.not.exist(val);
        done();
      });
  });

  it('test get callback function', function(done) {
    var key = faker.name.findName();
    var data = faker.name.findName();

    cache.wrap(key, data)
      .then(function(val) {

        return cache.get(key);
      }).then(function(val) {
        val.should.be.eql(val);
        done();
      });
  });

  it('test get promise function', function(done) {
    var key = faker.name.findName();
    var data = faker.name.findName();

    cache.wrap(key, data)
      .then(function(val) {
        val.should.be.eql(data);

        // get value from cache
        return cache.get(key);
      }).then(function(val) {
        val.should.be.eql(data);
        done();
      });
  });

  it('test pull promise function', function(done) {
    var key = faker.name.findName();
    var data = faker.name.findName();

    cache.wrap(key, data)
      .then(function(val) {
        val.should.be.eql(data);

        // get value from cache
        return cache.pull(key);
      }).then(function(val) {
        val.should.be.eql(data);

        setTimeout(function() {
          cache.get(key)
            .then(function(val) {
              should.not.exist(val);
              done();
            });
        }, 50)
      });
  });

  it('test pull promise function with default value', function(done) {
    var key = faker.name.findName();
    var data = faker.name.findName();

    cache.pull(key, data)
      .then(function(val) {
        val.should.be.eql(data);
        done();
      });
  });

  it('test pull promise function without default value', function(done) {
    var key = faker.name.findName();

    cache.pull(key)
      .then(function(val) {
        // val is null
        should.not.exist(val);
        done();
      });
  });

  it('test wrap callback function.', function(done) {
    var key = faker.name.findName();
    var data = faker.name.findName();

    cache.wrap(key, data, function(val) {
      val.should.be.eql(data);

      // get value from cache
      cache.get(key, function(val) {
        val.should.be.eql(data);
        done();
      });
    });
  });

  it('test wrap default data function.', function(done) {
    var key = faker.name.findName();
    var data = faker.name.findName();

    cache.wrap(key, function() {
      return data;
    }, function(val) {
      val.should.be.eql(data);

      // get value from cache
      cache.get(key, function(val) {
        val.should.be.eql(data);
        done();
      });
    });
  });

  it('hit cache for wrap.', function(done) {
    var key = faker.name.findName();
    var data = faker.name.findName();

    cache.set(key, data, function(val) {

      // get value from cache
      cache.wrap(key, {a: 1}, function(val) {
        val.should.be.eql(data);
        done();
      });
    });
  });

  it('support wrap callback function return zero value.', function(done) {
    var key = faker.name.findName();

    cache.wrap(key, function() { return 0; })
      .then(function() {
        return cache.get(key);
      }).then(function(val) {

        val.should.be.eql(0);
        done();
      });
  });

  it('wrap function support cache value is zero.', function(done) {
    var key = faker.name.findName();
    var data = 0;

    cache.set(key, data)
      .then(function() {

        // get value from cache
        return cache.wrap(key, 'appleboy', function(val) {
          val.should.be.eql(data);
          done();
        });
      });
  });

  it('wrap function support cache value is empty string.', function(done) {
    var key = faker.name.findName();
    var data = '';

    cache.set(key, data)
      .then(function() {

        // get value from cache
        return cache.wrap(key, 'appleboy', function(val) {
          val.should.be.eql(data);
          done();
        });
      });
  });

  it('test set callback.', function(done) {
    var key = faker.name.findName();
    var data = faker.name.findName();

    cache.set(key, data, function(val) {

      // get value from cache
      cache.get(key, function(val) {
        val.should.be.eql(data);
        done();
      });
    });
  });

  it('get empty value if time expired', function(done) {
    this.timeout(0);
    var key = faker.name.findName();
    var data = faker.name.findName();

    cache.set(key, data, 1)
      .then(function(val) {
        // get value from cache
        return cache.get(key);
      }).then(function(val) {
        should.exist(val);
        setTimeout(function() {

          cache.get(key, function(val) {
            should.not.exist(val);
            done();
          });
        }, 1100);
      });
  });

  it('test del callback.', function(done) {
    var key = faker.name.findName();
    var data = faker.name.findName();

    cache.set(key, data)
      .then(function() {
        return cache.get(key);
      }).then(function(val) {
        val.should.be.eql(data);

        return cache.del(key, function() {
          cache.get(key, function(val) {
            should.not.exist(val);
            done();
          });
        });
      });
  });

  it('test del promise function.', function(done) {
    var key = faker.name.findName();
    var data = faker.name.findName();

    cache.set(key, data)
      .then(function() {
        return cache.get(key);
      }).then(function(val) {
        val.should.be.eql(data);

        return cache.del(key);
      }).then(function() {

        return cache.get(key);
      }).then(function(val) {
        should.not.exist(val);

        done();
      });
  });

  it('test delete multiple key', function(done) {
    var keyOne = faker.name.findName();
    var keyTwo = faker.name.findName();
    var data = faker.name.findName();

    Promise.all([
      cache.set(keyOne, data),
      cache.set(keyTwo, data)
    ]).then(function() {

      return Promise.props({
        keyOne: cache.get(keyOne),
        keyTwo: cache.get(keyTwo)
      });
    }).then(function(keys) {

      return cache.del([keyOne, keyTwo]);
    }).then(function() {
      return Promise.props({
        keyOne: cache.get(keyOne),
        keyTwo: cache.get(keyTwo)
      });
    }).then(function(keys) {

      should.not.exist(keys.keyOne);
      should.not.exist(keys.keyTwo);
      done();
    });

  });

  it('test clear callback.', function(done) {
    var keyOne = faker.name.findName();
    var keyTwo = faker.name.findName();
    var data = faker.name.findName();

    cache.set(keyOne, data);
    cache.set(keyTwo, data);

    cache.clear(function() {
      return cache.get(keyOne);
    }).then(function(val) {
      should.not.exist(val);

      return cache.get(keyTwo);
    }).then(function(val) {
      should.not.exist(val);

      done();
    });
  });

  it('test clear promise function.', function(done) {
    var keyOne = faker.name.findName();
    var keyTwo = faker.name.findName();
    var data = faker.name.findName();

    cache.set(keyOne, data);
    cache.set(keyTwo, data);

    cache.clear()
      .then(function() {
        return cache.get(keyOne);
      }).then(function(val) {
        should.not.exist(val);

        return cache.get(keyTwo);
      }).then(function(val) {
        should.not.exist(val);

        done();
      });
  });

  it('get multiple cache key.', function(done) {
    var keyOne = faker.name.findName();
    var keyTwo = faker.name.findName();
    var dataOne = faker.name.findName();
    var dataTwo = faker.name.findName();

    cache.set(keyOne, dataOne);
    cache.set(keyTwo, dataTwo);

    cache.get([keyOne, keyTwo])
      .then(function(result) {

        result[keyOne].should.be.eql(dataOne);
        result[keyTwo].should.be.eql(dataTwo);
        done();
      });
  });

  it('should accept `redis` as valid engine', function(done) {
    var key = faker.name.findName();
    var data = faker.name.findName();
    cache = new Cacheman({engine: 'redis'});
    cache.set(key, {name: data}, function(val) {

      cache.get(key, function(val) {

        val.name.should.be.eql(data);
        done();
      });
    });
  });

  it('should accept `mongo` as valid engine', function(done) {
    var key = faker.name.findName();
    var data = faker.name.findName();
    cache = new Cacheman({engine: 'mongo'});
    cache.set(key, {name: data}, function(val) {

      cache.get(key, function(val) {

        val.name.should.be.eql(data);
        done();
      });
    });
  });
});
