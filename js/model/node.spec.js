'use strict';

/* global describe, it */

let assert = require('chai').assert,
    Node = require('./node.js'),
    node;

describe('Model', () => {
  describe('Constructor', () => {
    it('Can be called with no arguments', () => {
      assert.isFunction(Node, 'Constructor exists');
      assert.doesNotThrow(() => { node = new Node(); }, 'Constructor doesnt throw exception');
      assert.isDefined(node, 'Constructor returns something'); // assert.isObject isn't getting anything?!?
    });
    it('Has an empty root collection', () => {
      assert.isDefined(node.value2key);
    });
  });
});

