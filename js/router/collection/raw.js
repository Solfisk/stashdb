'use strict';

const Resource = require('../../model.js').Resource,
      Collection = require('../../model.js').Collection,
      router = require('express').Router(),
      pager = require('./pager.js'),
      Joi = require('joi'),
      queryValidator = Joi.object().keys({
        minRevision: Joi.number().min(0).integer()
      }).unknown(true);

router
  .get('*', 
    (req, res, next) => {
      if(!(req.stashdb.node instanceof Collection) || (typeof req.query.get === 'undefined')) {
        return next('route');
      } else {
        const queryValidation = queryValidator.validate(req.query);
        if(queryValidation.error) {
          res.status(400).send(queryValidation.error.details[0].message).end();
          return;
        }
      }

      const minRevision = parseInt(req.query.minRevision) || 0;
      
      res.append('Link', '<' + req.stashdb.node.path + '>; rel=canonical');
      res.append('Revision', req.stashdb.node.revisionNumber);
      const nextResult = req.stashdb.node.between(minRevision).next();
      if(nextResult.done) {
        // No more data for client
        res.append('Link', '<' + req.stashdb.node.path + '?get&minRevision=' + minRevision + '>; rel=next');
        res.status(204).end();
        return;
      } else {
        res.append('Link', '<' + req.stashdb.node.path + '?get&minRevision=' + (nextResult.value[2] + 1) +'>; rel=next');
        req.stashdb.node = nextResult.value[1];
        if(!req.stashdb.node) {
          // Deleted node in history - send tombstone
          res.set({'Resource-Revision': nextResult.value[2], 'Name': nextResult.value[0]});
          res.append('Link', '<' + req.stashdb.path + '>; rel=resource');
          res.status(204).end();
        }
        return next();
      }
    },
    require('../../middleware/renderer/resource.js')
  );

module.exports = router;

