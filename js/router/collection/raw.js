'use strict';

const Resource = require('../../model.js').Resource,
      Collection = require('../../model.js').Collection,
      router = require('express').Router();

router
  .get('*', (req, res, next) => {
    if(!(req.stashdb.node instanceof Collection) || (typeof req.query.get === 'undefined')) {
      return next('route');
    } else {
      req.stashdb.pager('get', 1);
      req.stashdb.node = req.stashdb.result[Object.keys(req.stashdb.result)[0]][1];
      return next();
    }
  }, require('../../middleware/renderer/resource.js'));

module.exports = router;

