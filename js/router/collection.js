'use strict';

const express = require('express'),
      Collection = require('../model.js').Collection;

const router = express.Router();
router.use(
  require('./collection/json.js'),
  require('./collection/raw.js')
);

module.exports = router;

