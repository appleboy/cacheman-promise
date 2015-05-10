'use strict';

var should = require('should');
var faker = require('faker');
var Cacheman = require('../lib')

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
  });

  it('should store items', function (done) {
    cache.set('test1', { a: 1 }, function (val) {

      cache.get('test1', function (val) {

        val.a.should.be.eql(1);
        done();
      });
    });
  });

  it('should store zero', function (done) {
    cache.set('test2', 0, function (val) {

      cache.get('test2', function (val) {

        val.should.be.eql(0);
        done();
      });
    });
  });

  it('should store false', function (done) {
    cache.set('test3', false, function (val) {

      cache.get('test3', function (val) {

        val.should.be.false;
        done();
      });
    });
  });

  it('should store null', function (done) {
    cache.set('test4', null, function (val) {

      cache.get('test4', function (val) {

        should.not.exist(val);
        done();
      });
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

        cache.get(key, function(val) {

          val.should.be.eql(val);
          done();
        });
      });
  });

  it('test get promise function', function(done) {
    var key = faker.name.findName();
    var data = faker.name.findName();

    cache.wrap(key, data)
      .then(function(val) {
        val.should.be.eql(data);

        // get value from cache
        cache.get(key, function(val) {
          val.should.be.eql(data);
          done();
        });
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

  it('should accept `redis` as valid engine', function (done) {
    var key = faker.name.findName();
    var data = faker.name.findName();
    cache = new Cacheman('testing', {engine: 'redis'});
    cache.set(key, {name: data}, function (val) {

      cache.get(key, function (val) {

        val.name.should.be.eql(data);
        done();
      });
    });
  });

  it('should accept `mongo` as valid engine', function (done) {
    var key = faker.name.findName();
    var data = faker.name.findName();
    cache = new Cacheman('testing', {engine: 'mongo'});
    cache.set(key, {name: data}, function (val) {

      cache.get(key, function (val) {

        val.name.should.be.eql(data);
        done();
      });
    });
  });
});
