'use strict';

const router = require('express').Router();

router.delete('*', (req, res, next) => {
  let node = req.app.locals.model.pointer(req.url).pop()[0];
  if(!node) {
    next();
  } else {
    node.detach();
    res.status(204).end();
  }
});

module.exports = router;

