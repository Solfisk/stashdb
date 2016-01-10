'use strict';

/* global describe, it */

let assert = require('chai').assert,
    Resource = require('./resource.js').Resource,
    resource;

describe('Constructor', () => {
  it('Can be called with no arguments', () => {
    assert.isFunction(Resource, 'Constructor exists');
    assert.doesNotThrow(() => { resource = new Resource(); }, 'Constructor doesnt throw exception');
    assert.isDefined(resource, 'Constructor returns something'); // assert.isObject isn't getting anything?!?
  });

  it('Rejects setting non-collections at /', () => {
    assert.throws(() => { resource.set('/', null); });
    assert.throws(() => { resource.set('/', 'x'); });
    assert.throws(() => { resource.set('/', {}); });
    assert.throws(() => { resource.set('/', []); });
    assert.throws(() => { resource.set('/', new Map()); });
  });

});

describe('Basic methods', () => {
});
