'use strict';

const zlib = require('zlib'),
      Resource = require('../../model.js').Resource,
      Collection = require('../../model.js').Collection,
      router = require('express').Router(),
      pager = require('./pager.js');

router
  .get('*',
    (req, res, next) => {
      if(!(req.stashdb.node instanceof Collection) || (typeof req.query.list === 'undefined') || !req.accepts('json')) {
        return next('route');
      } else {
        return next();
      }
    },
    pager('list', Infinity),
    (req, res, next) => {
      const result = {};
      let pager = req.stashdb.result.pager;
      for(let header of pager.headers) {
        res.append.apply(res, header);
      }
      for(let id in pager.content) {
        result[id] = req.stashdb.path + id;
      }
      res.json(result).end();
    }
  )
  .put('*', (req, res, next) => {
      if(!(req.stashdb.path.match(/\/$/)) || !req.headers['content-type'] === 'application/json') {
        return next('route');
      }
      return next();
    },
    require('body-parser').json(),
    (req, res, next) => {
      if(typeof req.body === 'object' && !(req.body instanceof Array)) {
      let collection = new Collection();
      for(let name in req.body) {
        let resource = new Resource();
        resource.contentType = 'application/json; charset=utf-8';
        resource.content = zlib.gzipSync(new Buffer(JSON.stringify(req.body[name])));
        collection.set(name, resource);
      }
      req.app.locals.model.set(req.stashdb.path, collection);
      res.status(204).end();
    } else {
      res.status(400).end();
    }
  });

module.exports = router;

