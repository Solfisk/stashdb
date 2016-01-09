'use strict';

/* global describe, it */

let assert = require('chai').assert,
    Resource = require('./resource.js'),
    resource;

describe('Constructor', () => {
  it('Can be called with no arguments', () => {
    assert.isFunction(Resource, 'Constructor exists');
    assert.doesNotThrow(() => { resource = new Resource(); }, 'Constructor doesnt throw exception');
    assert.isDefined(resource, 'Constructor returns something'); // assert.isObject isn't getting anything?!?
  });
});

describe('Basic methods', () => {
});
