'use strict';

const express  = require('express');
const Model = require('./model').Model;
const Store = require('./store');

// This route organization: http://codetunnel.io/an-intuitive-way-to-organize-your-expressjs-routes/

// http://martinfowler.com/articles/richardsonMaturityModel.html

// http://binaryjs.com/

// http://dataprotocols.org/ndjson/

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

// Use compression for compression responses

function Server(config) {
  const app = express();
  app.locals.model = new Model();
  app.locals.store = new Store(config ? config.path : '/tmp/', config ? config.dbSize : 1024 * 1024);
  app.locals.config = config || {};
  app.use(
    require('./middleware/init.js'),
    require('./middleware/auth.js'),
    require('./router/collection.js'),
    require('./router/resource/raw.js'),
    require('./router/delete-any.js')
  );
  app.get('*', function(req, res, next) {
    res.status(404).set('Content-Type', 'text/plain').send('Not found').end();
  });
  return app;
}

module.exports.Server = Server;

