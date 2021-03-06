'use strict';

let Node = require('./model/node.js'),
    Collection = require('./model/node/collection.js').Collection,
    Resource = require('./model/node/resource.js').Resource;

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
    let pointer = this.pointer(path),
        node = pointer.until((part) => { return !!part[0]; }).pop()[0],
        missing = pointer.from((part) => { return !part[0];}),
        lastPart;

    if(missing.length) {
      // The pointer contains at least one missing node
      lastPart = missing.pop()[1];
      for(let part of missing) {
         let next = part[1] === '/' ? new Collection() : new Resource();
         node.set(part[1], next);
         node = next;
      }
    } else {
      // The pointer contains nodes all the way
      // Get the node before (-2) the old node to replace
      node = pointer.slice(-2)[0][0];
      // Get the name of the new node (-1)
      lastPart = pointer.slice(-1)[0][1];
    }
    node.set(lastPart, value);
  }

}

module.exports = {
  Model: Model,
  Resource: Resource,
  Collection: Collection
};

