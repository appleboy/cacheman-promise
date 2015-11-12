/* global describe:false, before:false, it:false, afterEach:false */

import should from 'should';
import faker from 'faker';
import Promise from 'bluebird';
import Cacheman from '../build';

describe('Test Cache Engine:', () => {
  let cache;

  before((done) => {
    cache = new Cacheman('testing', {engine: 'redis'});
    done();
  });

  afterEach((done) => {
    cache.clear(() => {
      done();
    });
  });

  it('should have main methods', () => {
    cache.set.should.be.ok;
    cache.get.should.be.ok;
    cache.del.should.be.ok;
    cache.clear.should.be.ok;
    cache.wrap.should.be.ok;
  });

  it('should store items', (done) => {
    cache.set('test1', { a: 1 }, () => {
      cache.get('test1', (val) => {
        val.a.should.be.eql(1);
        done();
      });
    });
  });

  it('should store zero', (done) => {
    cache.set('test2', 0, () => {
      cache.get('test2', (val) => {
        val.should.be.eql(0);
        done();
      });
    });
  });

  it('should store false', (done) => {
    cache.set('test3', false, () => {
      cache.get('test3', (val) => {
        val.should.be.eql(false);
        done();
      });
    });
  });

  it('should store null', (done) => {
    cache.set('test4', null, () => {
      cache.get('test4', (val) => {
        should.not.exist(val);
        done();
      });
    });
  });

  it('get empty cache value if cache not found and no default value', (done) => {
    const key = faker.name.findName();

    cache.wrap(key)
      .then((val) => {
        should.not.exist(val);
        done();
      });
  });

  it('test get callback function', (done) => {
    const key = faker.name.findName();
    const data = faker.name.findName();

    cache.wrap(key, data)
      .then(() => {
        return cache.get(key);
      }).then((val) => {
        val.should.be.eql(data);
        done();
      });
  });

  it('test get promise function', (done) => {
    const key = faker.name.findName();
    const data = faker.name.findName();

    cache.wrap(key, data)
      .then((val) => {
        val.should.be.eql(data);

        // get value from cache
        return cache.get(key);
      }).then((val) => {
        val.should.be.eql(data);
        done();
      });
  });

  it('test pull promise function', (done) => {
    const key = faker.name.findName();
    const data = faker.name.findName();

    cache.wrap(key, data)
      .then((val) => {
        val.should.be.eql(data);

        // get value from cache
        return cache.pull(key);
      }).then((val) => {
        val.should.be.eql(data);

        setTimeout(() => {
          cache.get(key)
            .then((val2) => {
              should.not.exist(val2);
              done();
            });
        }, 50);
      });
  });

  it('test pull promise function with default value', (done) => {
    const key = faker.name.findName();
    const data = faker.name.findName();

    cache.pull(key, data)
      .then((val) => {
        val.should.be.eql(data);
        done();
      });
  });

  it('test pull promise function without default value', (done) => {
    const key = faker.name.findName();

    cache.pull(key)
      .then((val) => {
        // val is null
        should.not.exist(val);
        done();
      });
  });

  it('test wrap callback function.', (done) => {
    const key = faker.name.findName();
    const data = faker.name.findName();

    cache.wrap(key, data, (val) => {
      val.should.be.eql(data);

      // get value from cache
      cache.get(key, (val2) => {
        val2.should.be.eql(data);
        done();
      });
    });
  });

  it('test wrap default data function.', (done) => {
    const key = faker.name.findName();
    const data = faker.name.findName();

    cache.wrap(key, () => {
      return data;
    }, (val) => {
      val.should.be.eql(data);

      // get value from cache
      cache.get(key, (val2) => {
        val2.should.be.eql(data);
        done();
      });
    });
  });

  it('hit cache for wrap.', (done) => {
    const key = faker.name.findName();
    const data = faker.name.findName();

    cache.set(key, data, () => {
      // get value from cache
      cache.wrap(key, {a: 1}, (val) => {
        val.should.be.eql(data);
        done();
      });
    });
  });

  it('support wrap callback function return zero value.', (done) => {
    const key = faker.name.findName();

    cache.wrap(key, () => { return 0; })
      .then(() => {
        return cache.get(key);
      }).then((val) => {
        val.should.be.eql(0);
        done();
      });
  });

  it('wrap function support cache value is zero.', (done) => {
    const key = faker.name.findName();
    const data = 0;

    cache.set(key, data)
      .then(() => {
        // get value from cache
        return cache.wrap(key, 'appleboy', (val) => {
          val.should.be.eql(data);
          done();
        });
      });
  });

  it('wrap function support cache value is empty string.', (done) => {
    const key = faker.name.findName();
    const data = '';

    cache.set(key, data)
      .then(() => {
        // get value from cache
        return cache.wrap(key, 'appleboy', (val) => {
          val.should.be.eql(data);
          done();
        });
      });
  });

  it('test set callback.', (done) => {
    const key = faker.name.findName();
    const data = faker.name.findName();

    cache.set(key, data, () => {
      // get value from cache
      cache.get(key, (val) => {
        val.should.be.eql(data);
        done();
      });
    });
  });

  it('get empty value if time expired', (done) => {
    const key = faker.name.findName();
    const data = faker.name.findName();

    cache.set(key, data, 1)
      .then(() => {
        // get value from cache
        return cache.get(key);
      }).then((val) => {
        should.exist(val);
        setTimeout(() => {
          cache.get(key, (val2) => {
            should.not.exist(val2);
            done();
          });
        }, 1100);
      });
  });

  it('test del callback.', (done) => {
    const key = faker.name.findName();
    const data = faker.name.findName();

    cache.set(key, data)
      .then(() => {
        return cache.get(key);
      }).then((val) => {
        val.should.be.eql(data);

        return cache.del(key, () => {
          cache.get(key, (val2) => {
            should.not.exist(val2);
            done();
          });
        });
      });
  });

  it('test del promise function.', (done) => {
    const key = faker.name.findName();
    const data = faker.name.findName();

    cache.set(key, data)
      .then(() => {
        return cache.get(key);
      }).then((val) => {
        val.should.be.eql(data);

        return cache.del(key);
      }).then(() => {
        return cache.get(key);
      }).then((val) => {
        should.not.exist(val);

        done();
      });
  });

  it('test delete multiple key', (done) => {
    const keyOne = faker.name.findName();
    const keyTwo = faker.name.findName();
    const data = faker.name.findName();

    Promise.all([
      cache.set(keyOne, data),
      cache.set(keyTwo, data),
    ]).then(() => {
      return Promise.props({
        keyOne: cache.get(keyOne),
        keyTwo: cache.get(keyTwo),
      });
    }).then(() => {
      return cache.del([keyOne, keyTwo]);
    }).then(() => {
      return Promise.props({
        keyOne: cache.get(keyOne),
        keyTwo: cache.get(keyTwo),
      });
    }).then((keys) => {
      should.not.exist(keys.keyOne);
      should.not.exist(keys.keyTwo);
      done();
    });
  });

  it('test clear callback.', (done) => {
    const keyOne = faker.name.findName();
    const keyTwo = faker.name.findName();
    const data = faker.name.findName();

    cache.set(keyOne, data);
    cache.set(keyTwo, data);

    cache.clear(() => {
      return cache.get(keyOne);
    }).then((val) => {
      should.not.exist(val);

      return cache.get(keyTwo);
    }).then((val) => {
      should.not.exist(val);

      done();
    });
  });

  it('test clear promise function.', (done) => {
    const keyOne = faker.name.findName();
    const keyTwo = faker.name.findName();
    const data = faker.name.findName();

    cache.set(keyOne, data);
    cache.set(keyTwo, data);

    cache.clear()
      .then(() => {
        return cache.get(keyOne);
      }).then((val) => {
        should.not.exist(val);

        return cache.get(keyTwo);
      }).then((val) => {
        should.not.exist(val);

        done();
      });
  });

  it('get multiple cache key.', (done) => {
    const keyOne = faker.name.findName();
    const keyTwo = faker.name.findName();
    const dataOne = faker.name.findName();
    const dataTwo = faker.name.findName();

    cache.set(keyOne, dataOne);
    cache.set(keyTwo, dataTwo);

    cache.get([keyOne, keyTwo])
      .then((result) => {
        result[keyOne].should.be.eql(dataOne);
        result[keyTwo].should.be.eql(dataTwo);
        done();
      });
  });

  it('test delete cache with prefix name.', (done) => {
    cache = new Cacheman({engine: 'redis'});
    const data = faker.name.findName();

    Promise.all([
      cache.set('foo_1', data),
      cache.set('foo_2', data),
      cache.set('bar', data),
    ]).then(() => {
      return cache.del('foo*');
    }).then(() => {
      return cache.get('foo_1');
    }).then((val) => {
      should.not.exist(val);

      return cache.get('foo_2');
    }).then((val) => {
      should.not.exist(val);

      return cache.get('bar');
    }).then((val) => {
      should.exist(val);

      done();
    });
  });

  it('should accept `redis` as valid engine', (done) => {
    const key = faker.name.findName();
    const data = faker.name.findName();
    cache = new Cacheman('redis', {engine: 'redis'});
    cache.set(key, {name: data}, () => {
      cache.get(key, (val) => {
        val.name.should.be.eql(data);
        done();
      });
    });
  });

  it('should accept `mongo` as valid engine', (done) => {
    const key = faker.name.findName();
    const data = faker.name.findName();
    cache = new Cacheman('mongo', {engine: 'mongo'});
    cache.set(key, {name: data}, () => {
      cache.get(key, (val) => {
        val.name.should.be.eql(data);
        done();
      });
    });
  });
});
