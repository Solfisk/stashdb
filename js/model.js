'use strict';

let Collection = require('./model/node/collection.js');

/*

  Resource: object to be PUT, GET or DELETE'd
  Collection: collection of Resource objects, belonging to a parent Resource

*/

/*

My collection:

/my_collection/

My resource that owns my collection:

/my_collection

Meta collection about my_collection:

/my_collection/!

Collection with subscribers to my_collection:

/my_collection/!/subscribers/

Subscribers to the subscribers collection:

/my_collection/!/subscribers/!/subscribers/

This can be used to carry out two way acknowledging of changes committed.

Subscribers to the meta collection about my_collection:

/my_collection/!/!/subscribers/

*/


class Model {

  constructor() {
    this.root = new Collection();
  }

  resolve(path) {
    return [...this.traverse(path)].pop().shift() || undefined;
  }

  // Iterator with arrays containing [node, part] arrays
  // If traverse reaches an non-existent node, it will start emitting [null, part] arrays
  *traverse(path) {
    let node = new Map([['/', this.root]]),
        parts = path.match(/([^\/]+|\/+)/g) || [];

    while(node && parts.length) {
      node = node.get(parts[0]);
      if(!node) {
        for(let part of parts) {
          yield [null, part];
        }
        return;
      } else {
        yield [node, parts[0]];
      }
      parts.shift();
    }
    return;
  }

/*
  set(path, value, options) {
    let lastPart;
    for(let part of this.traverse(path)) {
      if(part instanceof Array) {
        if(lastPart) {
          if(lastPart.length === 1) {
            
          }
        } else {
          break;
        }
      }
      lastPart = part;
    }
  }
*/
}

module.exports = {
  Model: Model
};

