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
    const resource = new Resource();
    const storeDisk = cb => {
      const filename = join(req.app.locals.config.resourceDir, createHmac('sha256', 'stashdb').update(req.path).digest('hex'));
      resource.contentFile = filename;
      writeFile(filename, req.bodyBuffer, cb);
    };
    const storeRam = cb => {
      resource.content = req.bodyBuffer;
      cb();
    };
    const storeDb = cb => {
      const store = req.app.locals.store;
      const txn = store.begin();
      store.set(txn, 'resource', req.path, req.bodyBuffer);
      txn.commit();
      cb();
    };
    // const store = req.app.locals.config && req.app.locals.config.resourceDir ? storeDisk : storeRam;
    const store = storeDb;

    store(err => {
      if(err) {
        res.status(500).set('Content-Type', 'text/plain').send('Internal error while storing resource.').end();
      } else if(typeof req.headers['content-type'] === 'undefined') {
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
  });

module.exports = router;
