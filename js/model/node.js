'use strict';

class Node extends Map {

  constructor() {
    super();
    this.value2key = new WeakMap();
  }

  set(key, value) {
    let oldKey;
    if(typeof value !== 'object') {
      throw 'Value to set must be an object';
    }
    if(oldKey = this.value2key.get(value)) {
      this.delete(oldKey);
    }
    this.value2key.set(value, key);
    value.parent = this;
    return super.set(key, value);
  }

  delete(key) {
    let child = this.get(key);
    if(child) {
      child.parent = undefined;
    }
    this.value2key.delete(this.get(key));
    return super.delete(key);
  }

  clear() {
    this.value2key.clear();
    return super.clear();
  }

  keyFor(node) {
    return this.value2key.get(node);
  }

  get name() {
    if(this.parent) {
      return this.parent.keyFor(this);
    }
  }

  get path() {
    if(this.name) {
      return (this.parent ? this.parent.path : '') + this.name
    }
  }

  detach() {
    this.parent.delete(this.name);
  }
}

module.exports = Node;

