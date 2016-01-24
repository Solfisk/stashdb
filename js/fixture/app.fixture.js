'use strict';

const express = require('express'),
      zlib = require('zlib'),
      Model = require('../model.js').Model,
      Resource = require('../model.js').Resource,
      Collection = require('../model.js').Collection;

function App() {
  let model = new Model(),
      app = express();

  function resource(contentType, charset, contentString) {
    let resource = new Resource();
    resource.contentType = contentType;
    if(charset) {
      resource.charset = charset;
    }
    resource.content = new Buffer(contentString);
    return resource;
  }

  model.set('/a', resource('text/plain', 'utf-8', zlib.gzipSync('content: a')));
  model.set('/a/b', resource('application/json', 'utf-8', zlib.gzipSync(JSON.stringify({"w": [1, 2, null, "q"]}))));
  model.set('/a/b/c/', new Collection());
  app.locals.model = model;

  return app;
}

module.exports.App = App
