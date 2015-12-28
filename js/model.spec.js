'use strict';

/* global describe, it */

let assert = require('chai').assert,
    Model = require('./model.js').Model,
    model;

console.log(Model);

describe('Constructor', () => {
  it('Can be called with no arguments', () => {
    assert.isFunction(Model, 'Constructor exists');
    assert.doesNotThrow(() => { model = new Model(); }, 'Constructor doesnt throw exception');
    assert.isDefined(model, 'Constructor returns something'); // assert.isObject isn't getting anything?!?
  });
});

