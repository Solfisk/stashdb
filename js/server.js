'use strict';

const express  = require('express'),
      getRawBody = require('raw-body'),
      Model = require('./model.js').Model,
      Resource = require('./model.js').Resource,
      Collection = require('./model.js').Collection,
      CollectionJson = require('./router/collection-json').CollectionJson,
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

let zlib = require('zlib'),
    streamBuffers = require('stream-buffers'),
    jsonBodyParser = require('body-parser').json();

function streamBodyParser(req, res, next) {
  let encoding = (req.headers['content-encoding'] || 'identity').toLowerCase(),
      length = req.headers['content-length'],
      stream;

  switch (encoding) {
    case 'deflate':
      stream = zlib.createGzip();
      req.pipe(zlib.createInflate()).pipe(stream);
      break
    case 'gzip':
    case 'x-gzip':
      stream = req;
      stream.length = length;
      break
    case 'identity':
      stream = zlib.createGzip();
      req.pipe(stream);
      break
    default:
      res.status(415).end('Unsupported content encoding "' + encoding + '"');
  }

  req.bodyStream = stream;

  next();
}

function streamBodyBufferParser(req, res, next) {
  let writable = new streamBuffers.WritableStreamBuffer({initialSize: 100});
  writable.on('finish', () => {
    req.bodyBuffer = writable.getContents();
    next();
  });
  writable.on('error', () => {
    res.status(500).end();
  });

  req.bodyStream.pipe(writable);
}

function Server() {
  let app = express();
  app.locals.model = model;
  app.use(CollectionJson());
  app.get(/^.*[^\/]$/, (req, res, next) => {
    let node = app.locals.model.pointer(req.url).pop()[0];
    if(!node) {
      next();
    }
    if(node instanceof Resource) {
      res.set('Content-Type', node.contentType).set('Content-Encoding', 'gzip').send(node.content);
    } else {
      res.status(500).end();
    }
  });
  app.put(/^.*[^\/]$/, streamBodyParser, streamBodyBufferParser, (req, res, next) => {
    let resource = new Resource();
    resource.content = req.bodyBuffer;
    resource.contentType = req.headers['content-type'];
    app.locals.model.set(req.path, resource);
    res.status(204).end();
  });
  app.delete('*', (req, res, next) => {
    let node = app.locals.model.pointer(req.url).pop()[0];
    if(!node) {
      next();
    }
    node.detach();
    res.status(204).end();
  });
  app.all('*', (req, res) => {
    res.status(404).end();
  });
  return app;
}

module.exports.Server = Server;

