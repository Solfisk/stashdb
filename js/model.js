'use strict';

let Collection = require('./model/collection.js');

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
    let result = [...this.traverse(path)].pop();
    if(result instanceof Array) {
      result = undefined;
    }
    return result;
  }

  *traverse(path) {
    let node = new Map([['/', this.root]]),
        parts = path.match(/([^\/]+|\/+)/g) || [];

    while(node && parts.length) {
      node = node.get(parts[0]);
      if(!node) {
        yield [].concat(parts); // Caveat emptor: the result of match can't be passed to yield (probably a bug in node.js);
        return;
      } else {
        yield node;
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

