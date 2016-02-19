'use strict';

let Node = require('../node.js'),
    ResourceModule = require('./resource.js'); // Indirect import to support cyclic dependencies

class Revision {
  constructor(number, key) {
    this.number = number;
    this.key = key;
  }
}

class Collection extends Node {
  constructor() {  // Breaking Lisskovs principle - should accept iterator
    super();
    this.revisionNumber = 0;
    this.revisions = new Map();
    this.key2revision = new Map();
  }

  addRevision(key) {
    let revisionNumber = ++this.revisionNumber;
    this.revisions.delete(this.key2revision.get(key));
    this.key2revision.set(key, revisionNumber);
    this.revisions.delete(revisionNumber);
    this.revisions.set(revisionNumber, new Revision(revisionNumber, key));
  }

  set(key, value) {
    if(!(value instanceof ResourceModule.Resource)) {
      throw 'Value must be instance of Resource';
    }
    if(this.get(key) !== value) {
      this.addRevision(key);
      super.set(key, value);
    }
    return this;
  }

  delete(key) {
    this.addRevision(key);
    return super.delete(key);
  }

  clear() {
    for(let key of this.keys()) {
      this.delete(key);
    }
  }

  get name() {
    if(!this.parent) {
      return '/';
    } else {
      return super.name;
    }
  }

  *since(revisionNumber) {
    while(revisionNumber <= this.revisionNumber) {
      let revision = this.revisions.get(revisionNumber++);
      if(revision) {
        yield [revision.key, this.get(revision.key)];
      }
    }
  }
}

module.exports.Collection = Collection;

