'use strict';

const express  = require('express'),
      getRawBody = require('raw-body'),
      Model = require('./model.js').Model,
      Resource = require('./model.js').Resource,
      Collection = require('./model.js').Collection,
      CollectionJson = require('./router/collection-json.js').CollectionJson,
      ResourceRaw = require('./router/resource-raw.js').ResourceRaw,
      model = new Model();

// http://martinfowler.com/articles/richardsonMaturityModel.html

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


function Server() {
  let app = express();
  app.locals.model = model;
  app.use(CollectionJson());
  app.use(ResourceRaw());
  app.delete('*', (req, res, next) => {
    let node = app.locals.model.pointer(req.url).pop()[0];
    if(!node) {
      next();
    } else {
      node.detach();
      res.status(204).end();
    }
  });
  app.all('*', (req, res) => {
    res.status(404).end();
  });
  return app;
}

module.exports.Server = Server;

