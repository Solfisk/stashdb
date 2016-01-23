'use strict';

const express  = require('express');

function DeleteAny() {
  let router = express.Router();
  router.delete('*', (req, res, next) => {
    let node = req.app.locals.model.pointer(req.url).pop()[0];
    if(!node) {
      next();
    } else {
      node.detach();
      res.status(204).end();
    }
  });

  return router;
}

module.exports.DeleteAny = DeleteAny;

