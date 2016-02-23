'use strict';

const express = require('express');

const router = express.Router();
router.use(
  require('./collection/json.js')
);

module.exports = router;

