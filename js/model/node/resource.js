'use strict';

let Node = require('../node.js'),
    Collection = require('./collection.js');

class Resource extends Node {
  set(key, value) {
/*    if(!(value instanceof Collection)) {
      throw 'Value must be instance of Collection';
    } */
    return super.set(key, value);
  }
}

Resource.test = () => { console.log(Collection); };

module.exports = Resource;

