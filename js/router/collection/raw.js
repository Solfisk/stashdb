'use strict';

const Resource = require('../../model.js').Resource,
      Collection = require('../../model.js').Collection,
      router = require('express').Router(),
      pager = require('./pager.js');

router
  .get('*', 
    (req, res, next) => {
      if(!(req.stashdb.node instanceof Collection) || (typeof req.query.get === 'undefined')) {
        return next('route');
      } else if(typeof req.query.pageSize !== 'undefined' && req.query.pageSize != 1) {
        res.status(400).send('Unsupported value for pageSize. The only value supported is 1 - or you can leave the parameter out.').end();
        return;
      }
      return next();
    },
    pager('get', 1),
    (req, res, next) => {
      res.append('Link', '<' + req.stashdb.node.path + '>; rel=canonical');
      let pager = req.stashdb.result.pager;
      for(let header of pager.headers) {
        res.append.apply(res, header);
      }
      if(Object.keys(pager.content).length) {
        req.stashdb.node = pager.content[Object.keys(req.stashdb.result.pager.content)[0]][1];
        return next();
      } else {
        res.status(204).end();
        return;
      }
    },
    require('../../middleware/renderer/resource.js')
  );

module.exports = router;

