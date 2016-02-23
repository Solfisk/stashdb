'use strict';
const streamBuffers = require('stream-buffers'),
      streamBodyParser = require('./body-parser.js'),
      router = require('express').Router();

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

router.use(streamBodyParser, streamBodyBufferParser);

module.exports = router;

