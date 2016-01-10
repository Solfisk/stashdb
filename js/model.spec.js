'use strict';

/* global describe, it */

let assert = require('chai').assert,
    Model = require('./model.js').Model,
    Collection = require('./model/node/collection.js'),
    Resource = require('./model/node/resource.js'),
    model;

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
    });
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
      model.root.get('a').set('/', new Collection());
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
      assert.equal([...model.traverse('/')][0][0], model.root);
      assert.equal([...model.traverse('/')].length, 1);
      assert.equal([...model.traverse('/a')][1][0], model.root.get('a'));
      assert.equal([...model.traverse('/a')].length, 2);
      assert.equal([...model.traverse('/a/')][2][0], model.root.get('a').get('/'));
      assert.equal([...model.traverse('/a/')].length, 3);
    });

    it('Can traverse incomplete paths', () => {
      assert.equal([...model.traverse('/a/x')][3][1], 'x');
      assert.equal([...model.traverse('/a/x')].length, 4);
    });

    it('Can handle invalid paths', () => {
      assert.ok(model.traverse('').next().done);
      assert.ok(model.traverse().next().done);
    });
  });

  describe('Getting paths', () => {
    it('Can get existing nodes', () => {
      assert.equal(model.get('/'), model.root);
      assert.equal(model.get('/a'), model.root.get('a'));
      assert.equal(model.get('/a/'), model.root.get('a').get('/'));
    });

    it('Can handle non-existing nodes and invalid path expressions', () => {
      assert.isUndefined(model.get());
      assert.isUndefined(model.get(''));
      assert.isUndefined(model.get('x'));
      assert.isUndefined(model.get('/q'));
      assert.isUndefined(model.get('/q/'));
      assert.isUndefined(model.get('/q/w'));
    });
  });


  describe('Setting paths', () => {
    let c = new Resource();
    it('Can set a new resource', () => {
      assert.doesNotThrow(() => {
        model.set('/c', c);
      });
    });
    it('Can set a new collection', () => {
      let cc = new Collection();
      assert.doesNotThrow(() => {
        model.set('/c/', cc);
      });
    });
    it('Can set an existing resource');
    it('Can set an existing collection');
    it('Can set root');
    it('Can set a resource with incomplete path');
    it('Can set a collection with incomplete path');
  });
});

