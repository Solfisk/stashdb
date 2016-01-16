'use strict';

const express  = require('express'),
      zlib = require('zlib'),
      jsonBodyParser = require('body-parser').json(),
      Resource = require('../model.js').Resource,
      Collection = require('../model.js').Collection;

function CollectionJson() {
  let router = express.Router();

  router.get(/^.*\/$/, (req, res, next) => {
    if(req.accepts('json')) {
      let node = req.app.locals.model.pointer(req.url).pop()[0];
      if(!node) {
        next();
      }
      if(node instanceof Collection) {
        let result = {};
        for(let name of node.keys()) {
          result[name] = node.path + name;
        }
        res.json(result).end();
      } else {
        res.status(500).end();
      }
    } else {
      next();
    }
  });

  router.put(/^.*\/$/, jsonBodyParser, (req, res, next) => {
    if(req.headers['content-type'] === 'application/json') {
      if(typeof req.body === 'object' && !(req.body instanceof Array)) {
        let collection = new Collection();
        for(let name in req.body) {
          let resource = new Resource();
          resource.contentType = 'application/json; charset=utf-8';
          resource.content = zlib.gzipSync(new Buffer(JSON.stringify(req.body[name])));
          collection.set(name, resource);
        }
        req.app.locals.model.set(req.path, collection);
        res.status(204).end();
      } else {
        res.status(400).end();
      }
    } else {
      next();
    }
  });

  return router;
}

module.exports.CollectionJson = CollectionJson;

