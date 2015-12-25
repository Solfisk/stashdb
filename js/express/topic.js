'use strict';

const express = require('express');

module.exports = function(model) {
  const router = express.Router();
  
  const topicRegex = /^\w+$/;
  router.param('topic', function(req, res, next, topic) {
    if(topic.match(topicRegex)) {
      next();
    } else {
      res.status(404).end();
    }
  });

  router.get('/:topic', function(req, res, next) {
    console.log('hej');
    console.log(model);
    res.end();
  });
  
  return router;
};
