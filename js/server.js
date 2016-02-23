'use strict';

const express  = require('express'),
      getRawBody = require('raw-body'),
      Model = require('./model.js').Model,
      ResourceRaw = require('./router/resource/raw.js').ResourceRaw,
      DeleteAny = require('./router/delete-any.js').DeleteAny,
      model = new Model();

// This route organization: http://codetunnel.io/an-intuitive-way-to-organize-your-expressjs-routes/

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
  app.use(require('./router/collection.js'));//, ResourceRaw(), DeleteAny());
  app.get('*', function(req, res, next) {
    res.status(404).set('Content-Type', 'text/plain').send('Not found').end();
  });
  return app;
}

module.exports.Server = Server;

