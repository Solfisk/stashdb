'use strict';

const express = require('express'),
      zlib = require('zlib'),
      streamBuffers = require('stream-buffers'),
      Resource = require('../model.js').Resource,
      Collection = require('../model.js').Collection;

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

function ResourceRaw() {
  let router = express.Router();

  router.route(/^.*[^\/]$/)
    .get((req, res, next) => {
      let node = req.app.locals.model.pointer(req.url).pop()[0];
      if(!node) {
        next();
      }
      if(node instanceof Resource) {
        if(node.content) {
          if(req.accepts(node.contentType)) {
            res.set('Content-Type', node.contentType).set('Content-Encoding', 'gzip').send(node.content);
          } else {
            res.status(406).end();
          }
        } else {
          res.status(204).end();
        }
      } else if(node === null || node === undefined) {
        res.status(404).end();
      } else {
        console.warn('Node not instanceof Resource: ' + node);
        res.status(500).end();
      }
    })
    .put(streamBodyParser, streamBodyBufferParser, (req, res, next) => {
      let resource = new Resource();
      resource.content = req.bodyBuffer;
      resource.contentType = req.headers['content-type'];
      req.app.locals.model.set(req.path, resource);
      res.status(204).end();
    });

  return router;
}

module.exports.ResourceRaw = ResourceRaw;

