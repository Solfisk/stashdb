'use strict';

let Collection = require('./model/node/collection.js'),
    Resource = require('./model/node/resource.js');

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
    let parts = (path || '').match(/([^\/]+|\/+)/g) || [],
        node = new Map([['/', this.root]]);

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

  pointer(path) {

    class LookArray extends Array {
      exists() {
        return this.every((part) => { return !!part[0]; });
      }

      until(cb) {
        let pass = true;
        return this.filter((part) => { return pass = pass && cb(part); });
      }

      from(cb) {
        let pass = false;
        return this.filter((part) => { return pass = pass || cb(part); });
      }
    }

    return LookArray.from([...this.traverse(path)]);
  }

  get(path) {
    return (this.pointer(path).pop() || [])[0] || undefined;
  }

  set(path, value, options) {
    let pointer = this.pointer(path);
    let node = pointer.until((part) => { return !!part[0]; }).pop()[0];
    let missing = pointer.from((part) => { return !part[0];});
    let lastPart = missing.pop();
    for(let part of missing) {
       let next = part[1] === '/' ? new Collection() : new Resource();
       node.set(part[1], next);
       node = next;
    }
    node.set(lastPart, value);
  }

}

module.exports = {
  Model: Model
};

