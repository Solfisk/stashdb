'use strict';
const lmdb = require('node-lmdb');

class Store {

  constructor(path, mapSize) {
    this.env = new lmdb.Env();
    this.env.open({path, mapSize, maxDbs: 2});
    this.resource = this.env.openDbi({name: 'resource', create: true});
    this.meta = this.env.openDbi({name: 'meta', create: true});
  }
  
  close() {
    this.resource.close();
    this.meta.close();
    this.env.close();
  }

  begin() {
    return this.env.beginTxn();
  }

  get(txn, type, path) {
    if(type === 'meta' || type === 'resource') {
      const raw = txn.getBinary(this[type], path);
      return raw;
    } else {
      throw new Error(`Unknown payload type: ${type}`);
    }
  }
  
  getMeta(txn, path) {
    const raw = this.get(txn, 'meta', path);
    if(raw) {
      try {
        return JSON.parse(raw);
      } catch(error) {
        // Fatal error: unable to parse JSON
        throw new Error('Unable to parse metadata');
      }
    }
  }
  
  set(txn, type, path, data) {
    if(type === 'meta' || type === 'resource') {
      txn.putBinary(this[type], path, data);
    } else {
      throw new Error(`Unknown payload type: ${type}`);
    }
  }
  
  setMeta(txn, path, meta) {
    this.set(txn, 'meta', path, new Buffer(JSON.stringify(meta)));
  }
  
  delete(txn, path) {
    txn.del(this.meta, path);
    txn.del(this.resource, path);
  }

}

module.exports = Store;
