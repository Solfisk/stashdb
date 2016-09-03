'use strict';

// Cyclic: http://stackoverflow.com/questions/10869276/how-to-deal-with-cyclic-dependencies-in-node-js

let Node = require('../node.js'),
    CollectionModule = require('./collection.js'); // Indirect import to support cyclic dependencies

class Resource extends Node {
  set(key, value) {
    if(key === '/' && !(value instanceof CollectionModule.Collection)) {
      throw new Error('Value must be instance of Collection');
    }
    return super.set(key, value);
  }
}

Node.Collection = () => { return Collection; };

module.exports.Resource = Resource;
