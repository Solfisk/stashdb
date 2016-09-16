'use strict';

const createHmac = require('crypto').createHmac,
      writeFile = require('fs').writeFile,
      join = require('path').join,
      Resource = require('../../model.js').Resource,
      Collection = require('../../model.js').Collection,
      router = require('express').Router();

router.route(/^.*[^\/]$/)
  .get(require('../../middleware/renderer/resource.js'))
  .put(require('../stream/body-buffer-parser.js'), (req, res, next) => {
    
    if(typeof req.headers['content-type'] === 'undefined') {
      res.status(400).set('Content-Type', 'text/plain').send('Missing Content-Type').end();
    } else {
      const resource = new Resource();
      const store = req.app.locals.store;
      const txn = store.begin();

      const match = req.headers['content-type'].match(/([^ ;]+)(?:; *charset=(.+))?/i);
      resource.contentType = match[1];
      if(match[2]) {
        resource.charset = match[2];
      } else {
        // JSON and text defaults to utf-8
        if(req.is('json') || req.is('text/*')) {
          resource.charset = 'utf-8';
        }
      }
      store.setMeta(txn, req.path, JSON.stringify({contentType: resource.contentType, charset: resource.charset, path: req.path}));
      store.set(txn, 'resource', req.path, req.bodyBuffer);
      txn.commit();

      req.app.locals.model.set(req.path, resource);
      res.status(204).end();
    }
  });

module.exports = router;
