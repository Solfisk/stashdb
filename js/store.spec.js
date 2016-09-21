'use strict';
/* global describe, it */

const assert = require('chai').assert;
const Store = require('./store');

describe('Store', () => {
  it('Can restore', done => {
    const store = new Store('/tmp/', 1024 * 1024);
    const txn = store.begin();
    store
      .restore(txn, './js/fixture/data', '/')
      .catch(done)
      .then(() => {
        assert.equal(store.get(txn, '/subdir1/file1.txt').toString(), 'file1', 'File contents are preserved');
        assert.equal(store.get(txn, '/subdir1/file2.txt').toString(), 'file2', 'File contents are preserved');
        txn.commit();
      })
      .then(() => done())
      .catch(done);
  });
  it('Can dir', done => {
    const store = new Store('/tmp/', 1024 * 1024);
    const txn = store.begin();
    assert.deepEqual(store.dir(txn, '/'), [
      '/',
      '/subdir1/',
      '/subdir1/file1.txt',
      '/subdir1/file2.txt',
      '/subdir1/subdir2/',
      '/subdir1/subdir2/file3.txt'
    ]);
    done();
  });
});