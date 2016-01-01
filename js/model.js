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
    let res = {collection: this.root},
        parts = path.match(/([^\/]+|\/+)/g) || [];
    if(parts[0] !== '/') {
      // The path doesn't have a leading slash which is mandatory
      return;
    }
    while(res && parts.shift()) {
      let coll = res.collection,
          name = parts.shift();
      if(coll && name) {
        res = coll.get(name);
      } else {
        // Either: coll is undefined because it doesn't exist, so resolve to undefined
        // Or: name is undefined, so resolve with this collection (if any)
        return coll;
      }
    }
    return res;
  }

  *traverse(path) {
    let res = {collection: this.root},
        parts = path.match(/([^\/]+|\/+)/g) || [];
    if(parts[0] !== '/') {
      // The path doesn't have a leading slash which is mandatory
      return;
    }
    while(res && parts[0]) {
      let coll = res.collection,
          name = parts[1];
      if(coll) {
        parts.shift();
        yield coll;
      }
      if(coll && name) {
        res = coll.get(name);
        if(res) {
          parts.shift();
          yield res;
        }
      } else {
        // Either: coll is undefined because it doesn't exist, so resolve to undefined
        // Or: name is undefined, so resolve with this collection (if any)
        if(!coll) {
          yield parts;
        }
        return;
      }
      if(!res) {
        yield [].concat(parts); // Caveat emptor: the result of match can't be passed to yield (probably a bug in node.js)
      }
    }
    return;
  }

}

module.exports = {
  Model: Model
};

