'use strict';

const http  = require('http'),
      Model = require('./model.js').Model,
      model = new Model();

http.createServer(function(req, res) {
  console.log(req.method);
  res.write('hej');
  res.end();
}).listen(8000);

