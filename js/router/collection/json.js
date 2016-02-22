'use strict';

const express  = require('express'),
      zlib = require('zlib'),
      jsonBodyParser = require('body-parser').json(),
      Resource = require('../../model.js').Resource,
      Collection = require('../../model.js').Collection;

function CollectionJson() {
  let router = express.Router();

  router.route(/^.*\/(\?.*)*$/)
   .get((req, res, next) => {
      if(req.accepts('json')) {
        let node = req.app.locals.model.pointer(req.path).pop()[0];
        if(!node) {
          console.log(req.path + ' not found - next()');
          next();
          return;
        }
        if(node instanceof Collection) {
          const pageSize = req.query.pageSize || Infinity,
                page = req.query.page || 1,
                fromRevision = req.query.fromRevision || 0,
                toRevision = req.query.toRevision || node.revisionNumber;
          let result = {},
              i = 0;
          for(let revisionPair of node.between(fromRevision, toRevision)) {
            i++;
            if(i > (pageSize * page || 0) || revisionPair[1].revisionNumber > toRevision) {
              break;
            } else if(i > (pageSize * (page - 1) || 0)) {
              result[revisionPair[0]] = node.path + revisionPair[0];
            }
          }
          if(pageSize < Infinity) {
            res.header('Link', '<' + node.path + '?page=' + (page + 1) + '&pageSize=' + pageSize + '&fromRevision=' + fromRevision + '&toRevision=' + toRevision + '>; rel=next');
          }
          res.header('Collection-Revision', node.revisionNumber).json(result).end();
        } else {
          res.status(500).end();
        }
      } else {
        console.log('CollectionJson - request doesnt accept json - next()');
        next();
        return;
      }
    })
    .put(jsonBodyParser, (req, res, next) => {
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
        return;
    }
  });

  return router;
}

module.exports.CollectionJson = CollectionJson;

