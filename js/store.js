'use strict';

const lmdb = require('node-lmdb');
const readdir = require('mz/fs').readdir;
const stat = require('mz/fs').stat;
const readFile = require('mz/fs').readFile;
const join = require('path').join;

class Store {

  constructor(path, mapSize) {
    this.env = new lmdb.Env();
    this.env.open({path, mapSize, maxDbs: 2});
    this.resource = this.env.openDbi({name: 'resource', create: true});
  }
  
  close() {
    this.resource.close();
    this.env.close();
  }

  begin() {
    const txn = this.env.beginTxn();
    
    txn.getObject = (db, path) => {
      const raw = txn.getBinary(db, path);
      if(raw) {
        try {
          return JSON.parse(raw);
        } catch(error) {
          // Fatal error: unable to parse JSON
          throw new Error('Unable to parse metadata');
        }
      }
    };
    
    txn.putObject = (db, path, data) => {
      txn.putBinary(db, path, new Buffer(JSON.stringify(meta)));
    };
    
    txn.dir = (db, path) => {
      const result = [];
      const cursor = new lmdb.Cursor(txn, db);
      for(let key = cursor.goToKey(path); key; key = cursor.goToNext()) {
        if(key >= path && key.substring(0, path.length) === path) {
          result.push(key);
        } else {
          break;
        }
      };
      return result;
    };
  }

  restore(txn, srcPath, dstPath, component) {
    const src = join(srcPath, component || '.');
    const dst = join(dstPath, component || '');
    
    return stat(src)
      .then(stats => {
        if(stats.isFile()) {
          return readFile(src)
            .then(data => this.set(txn, dst, data));
        } else if(stats.isDirectory()) {
          return readdir(src)
            .then(nextComponents => {
              const dstDir = dst.match(/\/$/) ? dst : `${dst}/`;
              return Promise.all(nextComponents.map(nextComponent => this.restore(txn, srcPath, dstPath, join(component || '.', nextComponent))))
            });
        }
      });
  }
}

module.exports = Store;
