'use strict';

class Resource {
  constructor(document, children) {
    this.document = document;
    if(children) {
      this.collection = new Collection(children);
    }
  }
}

class Collection extends Map {
  constructor(children) {
    super();
    this.revison = 0;
    this.revisions = new WeakMap();
    if(children) {
      this.add(children);
    }
  }

  set(key, value) {
    this.revision++;
    this.revisions[revision] = key;
    return super.set(key, value);
  }

  delete(key) {
    this.revision++;
    this.revisions[revision] = key;
    return super.delete(key);
  }
}

module.exports = class {
  constructor(root) {
    this.root = root || new Resource();
  }
};

/*

  Resource: object to be PUT, GET or DELETE'd
  Collection: collection of Resource objects, belonging to a parent Resource

*/

