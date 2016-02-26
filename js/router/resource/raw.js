'use strict';

const Resource = require('../../model.js').Resource,
      Collection = require('../../model.js').Collection,
      router = require('express').Router();

router.route(/^.*[^\/]$/)
  .get(require('../../middleware/renderer/resource.js'))
  .put(require('../stream/body-buffer-parser.js'), (req, res, next) => {
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

module.exports = router;
