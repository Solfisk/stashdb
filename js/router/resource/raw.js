'use strict';

const express = require('express'),
      zlib = require('zlib'),
      streamBuffers = require('stream-buffers'),
      Resource = require('../../model.js').Resource,
      Collection = require('../../model.js').Collection,
      streamBodyBufferParser = require('../stream-body-buffer-parser.js').streamBodyBufferParser;

function ResourceRaw() {
  let router = express.Router();

  router.route(/^.*[^\/]$/)
    .get((req, res, next) => {
      let node = req.app.locals.model.pointer(req.url).pop()[0];
      if(!node) {
        console.log('ResourceRaw: ' + req.url + ' not found - next()');
        next();
        return;
      }
      if(node instanceof Resource) {
        if(node.content) {
          if(req.accepts(node.contentType) && req.acceptsCharsets(node.charset) && req.acceptsEncodings('gzip')) {
            res.set({'Content-Type': node.contentType + (node.charset ? '; charset=' + node.charset : ''), 'Content-Encoding': 'gzip'}).send(node.content);
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
    .put(streamBodyBufferParser, (req, res, next) => {
      let resource = new Resource();
      resource.content = req.bodyBuffer;
      if(typeof req.headers['content-type'] === 'undefined') {
        res.status(400).set('Content-Type', 'text/plain').send('Missing Content-Type').end();
      } else {
        let match = req.headers['content-type'].match(/([^ ;]+)(?:; *charset=(.+))?/i);
        resource.contentType = match[1];
        if(match[2]) {
          resource.charset = match[2];
        } else {
          // JSON and text defaults to utf-8
          if(req.is('json') || req.is('text/*')) {
            resource.charset = 'utf-8';
	  }
        }
        req.app.locals.model.set(req.path, resource);
        res.status(204).end();
      }
    });

  return router;
}

module.exports.ResourceRaw = ResourceRaw;

