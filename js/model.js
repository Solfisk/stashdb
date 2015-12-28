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
    let names = path.match(/[^\/]+\/?/g);
    if(path.substr(1, 1) !== '/') {
      // The path doesn't have a leading slash which is mandatory
      return;
    }
    let coll = this.root;
    for(let name of names) {
      let res = coll.get(name);
      if(name.substr(-1, 1) === '/') {
        coll = res ? res.collection : null;
        if(!coll) {
          return;
        }
      } else {
        return res;
      }
    }
    
    return coll;
  }
}

module.exports = {
  Model: Model
};


