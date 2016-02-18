'use strict';
const express = require('express'),
      streamBuffers = require('stream-buffers'),
      streamBodyParser = require('./stream-body-parser.js').streamBodyParser;

function streamBodyBufferParser(req, res, next) {
  let writable = new streamBuffers.WritableStreamBuffer({initialSize: 100});
  writable.on('finish', () => {
    req.bodyBuffer = writable.getContents();
    next();
  });
  writable.on('error', () => {
    res.status(500).end();
  });

  req.bodyStream.pipe(writable);
}

const router = express.Router();
router.use(streamBodyParser, streamBodyBufferParser);

module.exports.streamBodyBufferParser = router;

