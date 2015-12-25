'use strict';

const express = require('express'),
      app     = express(),
      Model   = require('./model.js'),
      model   = new Model();

for(let path of ['topic']) {
  var Router = require('./express/' + path + '.js');
  var router = new Router(model);
  app.use('/' + path, router);
}

app.listen(3000);
