'use strict';

const express = require('express'),
      Model = require('../model.js').Model,
      Resource = require('../model.js').Resource,
      Collection = require('../model.js').Collection;

function App() {
  let model = new Model(),
      app = express();

  function resource(contentType, contentString) {
    let resource = new Resource();
    resource.contentType = contentType;
    resource.content = new Buffer(contentString);
    return resource;
  }

  model.set('/a', resource('text/plain', 'content: a'));
  model.set('/a/b', resource('application/json', JSON.stringify({"w": [1, 2, null, "q"]})));
  model.set('/a/b/c/', new Collection());
  app.locals.model = model;

  return app;
}

module.exports.App = App
