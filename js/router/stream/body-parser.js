'use strict';

const zlib = require('zlib');

function streamBodyParser(req, res, next) {
  let encoding = (req.headers['content-encoding'] || 'identity').toLowerCase(),
      length = req.headers['content-length'],
      stream;

  switch (encoding) {
    case 'deflate':
      stream = zlib.createGzip();
      req.pipe(zlib.createInflate()).pipe(stream);
      break
    case 'gzip':
    case 'x-gzip':
      stream = req;
      stream.length = length;
      break
    case 'identity':
      stream = zlib.createGzip();
      req.pipe(stream);
      break
    default:
      res.status(415).end('Unsupported content encoding "' + encoding + '"');
  }

  req.bodyStream = stream;

  next();
}

module.exports = streamBodyParser;
