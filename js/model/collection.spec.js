'use strict';

/* global describe, it */

let assert = require('chai').assert,
    Collection = require('./collection.js'),
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
  it('Always returns empty iterator when calling since on empty collection', () => {
    assert.deepEqual([...collection.since(0)], []);
    assert.deepEqual([...collection.since(-1)], []);
    assert.deepEqual([...collection.since(1)], []);
  });
  it('Can set a => x', () => {
    collection.set('a', 'x');
    assert.deepEqual([...collection], [['a', 'x']], 'Collection contains a => x');
    assert.equal(collection.get('a'), 'x', 'And get(a) returns x');
  });
  it('Can set b => y', () => {
    collection.set('b', 'y');
    assert.deepEqual([...collection], [['a', 'x'], ['b', 'y']], 'Collection contains a => x and b => y');
    assert.equal(collection.get('b'), 'y', 'And get(b) returns y');
  });
  it('Has correct revision entries', () => {
    assert.equal(collection.revisionNumber, 2);
    assert.deepEqual([...collection.since(0)], [['a', 'x'], ['b', 'y']]);
    assert.deepEqual([...collection.since(3)], []);
  });
  it('Supports delete', () => {
    collection.delete('a');
    assert.deepEqual([...collection], [['b', 'y']], 'Collection contains b => y');
    assert.deepEqual([...collection.since(0)], [['b', 'y'], ['a', undefined]], 'History contains tombstone for a');
  });
  it('Supports reinsertion of elements', () => {
    collection.set('a', 'x2');
    assert.deepEqual([...collection], [['b', 'y'], ['a', 'x2']], 'Collection contains b => y and a => x2');
    assert.deepEqual([...collection.since(0)], [['b', 'y'], ['a', 'x2']], 'History contains b => y and a => x2');
  });
  it('Supports clear()', () => {
    collection.clear();
    assert.deepEqual([...collection], [], 'Collection is empty');
    assert.deepEqual([...collection.since(0)], [['b', undefined], ['a', undefined]], 'History contains tombstones for a and b');
  });
});

