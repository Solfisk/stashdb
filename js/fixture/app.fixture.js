'use strict';

const express = require('express');
const zlib = require('zlib');
const Model = require('../model.js').Model;
const Resource = require('../model.js').Resource;
const Collection = require('../model.js').Collection;
const Store = require('../store');

function App() {
  const model = new Model();
  const app = express();
  const store = new Store('/tmp/', 1024 * 1024);

  function resource(contentType, charset, contentString) {
    let resource = new Resource();
    resource.contentType = contentType;
    if(charset) {
      resource.charset = charset;
    }
    resource.content = new Buffer(contentString);
    return resource;
  }

  model.fixture = {
    setPlain: (key, value) => {
      model.set(key, resource('text/plain', 'utf-8', zlib.gzipSync('content: ' + value)));
    },
    setJson: (key, value) => {
      model.set(key, resource('application/json', 'utf-8', zlib.gzipSync(JSON.stringify(value))));
    },
    newCollection: (key) => {
      model.set(key, new Collection());
    },
    delete: (key) => {
      model.get(key).detach();
    }
  };

  model.fixture.setPlain('/a', 'content: a');
  model.fixture.setJson('/a/b', {"w": [1, 2, null, "q"]});
  model.fixture.newCollection('/a/b/c/');

  app.locals.model = model;
  app.locals.store = store;

  return app;
}

module.exports.App = App
