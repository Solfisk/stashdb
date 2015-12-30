'use strict';

/* global describe, it */

let assert = require('chai').assert,
    Model = require('./model.js').Model,
    Collection = require('./model/collection.js'),
    Resource = require('./model/resource.js'),
    model;

console.log(Model);

describe('Model', () => {
  describe('Constructor', () => {
    it('Can be called with no arguments', () => {
      assert.isFunction(Model, 'Constructor exists');
      assert.doesNotThrow(() => { model = new Model(); }, 'Constructor doesnt throw exception');
      assert.isDefined(model, 'Constructor returns something'); // assert.isObject isn't getting anything?!?
    });
    it('Has an empty root collection', () => {
      assert.isDefined(model.root);
      assert.instanceOf(model.root, Collection);
      assert.equal(model.root.size, 0);
  //    console.log('Model 0: ' + model);
  //    console.log('hej!!!');
    });
    console.log('Model 1: ' + model);
  });

  describe('Resolving paths', () => {
    it('Can resolve root', () => {
      assert.isDefined(model);
      assert.isDefined(model.root);
      assert.equal(model.resolve('/'), model.root);
    });

    it('Can resolve paths', () => {
      // First a fixture:
      model.root.set('a', new Resource());
      model.root.get('a').collection = new Collection();
      model.root.get('a').id = 'a';
      model.root.set('b', new Resource());

      assert.isDefined(model.resolve('/a'));
      assert.instanceOf(model.resolve('/a'), Resource);
      assert.equal(model.resolve('/a'), model.root.get('a'));

      assert.isDefined(model.resolve('/b'));
      assert.instanceOf(model.resolve('/b'), Resource);
      assert.equal(model.resolve('/b'), model.root.get('b'));
    });

    it('Can resolve collections', () => {
      assert.isDefined(model.resolve('/a/'));
    });

    it('Handles non-existing resources', () => {
      assert.isUndefined(model.resolve('/b/x'));
      assert.isUndefined(model.resolve('/a/x'));
      assert.isUndefined(model.resolve('/x'));
      assert.isUndefined(model.resolve('/x/y'));
    });

    it('Handles non-existing collections', () => {
      assert.isUndefined(model.resolve('/b/'));
      assert.isUndefined(model.resolve('/b/x/'));
      assert.isUndefined(model.resolve('/a/x/'));
      assert.isUndefined(model.resolve('/x/'));
      assert.isUndefined(model.resolve('/x/y/'));
    });
  });

  describe('Traversing paths', () => {
    it('Can traverse complete paths', () => {
      assert.equal([...model.traverse('/')][0], model.root);
      assert.equal([...model.traverse('/')].length, 1);
      assert.equal([...model.traverse('/a')][1], model.root.get('a'));
      assert.equal([...model.traverse('/a')].length, 2);
      assert.equal([...model.traverse('/a/')][2], model.root.get('a').collection);
      assert.equal([...model.traverse('/a/')].length, 3);
    });
    it('Can traverse incomplete paths', () => {
      assert.equal([...model.traverse('/a/x')][3][0], 'x');
      assert.equal([...model.traverse('/a/x')].length, 4);
    });
  });
});

