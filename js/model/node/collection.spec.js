'use strict';

/* global describe, it */

let assert = require('chai').assert,
    Collection = require('./collection.js').Collection,
    Resource = require('./resource.js').Resource,
    collection;

describe('Constructor', () => {
  it('Can be called with no arguments', () => {
    assert.isFunction(Collection, 'Constructor exists');
    assert.doesNotThrow(() => { collection = new Collection(); }, 'Constructor doesnt throw exception');
    assert.isDefined(collection, 'Constructor returns something'); // assert.isObject isn't getting anything?!?
    assert.equal(collection.revisionNumber, 0, 'Starting revision is zero');
    assert.deepEqual([...collection], [], 'Collection is empty upon initialization');
  });
});

describe('Basic methods', () => {
  let x = new Resource(),
      y = new Resource(),
      x2 = new Resource();

  it('Always returns empty iterator when calling since on empty collection', () => {
    assert.deepEqual([...collection.between(0)], []);
    assert.deepEqual([...collection.between(-1)], []);
    assert.deepEqual([...collection.between(1)], []);
  });
  it('Can set a => x', () => {
    collection.set('a', x);
    assert.deepEqual([...collection], [['a', x]], 'Collection contains a => x');
    assert.equal(collection.get('a'), x, 'And get(a) returns x');
  });
  it('Can set b => y', () => {
    collection.set('b', y);
    assert.deepEqual([...collection], [['a', x], ['b', y]], 'Collection contains a => x and b => y');
    assert.equal(collection.get('b'), y, 'And get(b) returns y');
  });
  it('Has correct revision entries', () => {
    assert.equal(collection.revisionNumber, 2);
    assert.deepEqual([...collection.between(0)], [['a', x, 1], ['b', y, 2]]);
    assert.deepEqual([...collection.between(3)], []);
  });
  it('Supports delete', () => {
    collection.delete('a');
    assert.deepEqual([...collection], [['b', y]], 'Collection contains b => y');
    assert.deepEqual([...collection.between(0)], [['b', y, 2], ['a', undefined, 3]], 'History contains tombstone for a');
  });
  it('Supports reinsertion of elements', () => {
    collection.set('a', x2);
    assert.deepEqual([...collection], [['b', y], ['a', x2]], 'Collection contains b => y and a => x2');
    assert.deepEqual([...collection.between(0)], [['b', y, 2], ['a', x2, 4]], 'History contains b => y and a => x2');
  });
  it('Has working between method', () => {
    assert.deepEqual([...collection.between(0, 0)], [], 'History from 0 to 0 is empty');
    assert.deepEqual([...collection.between(0, 1)], [], 'History from 0 to 1 is empty');
  });
  it('Supports clear()', () => {
    collection.clear();
    assert.deepEqual([...collection], [], 'Collection is empty');
    assert.deepEqual([...collection.between(0)], [['b', undefined, 5], ['a', undefined, 6]], 'History contains tombstones for a and b');
  });
});

