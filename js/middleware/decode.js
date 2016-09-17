'use strict';

const zlib = require('zlib');

/*
 * Decoding middleware
 * 
 * Adds the property requestStreams to res.locals containing two
 * readable streams:
 * 
 * identity: the decoded payload
 * gzip: the payload compressed as gzip
 * 
 */

function decode(req, res, next) {
  const encoding = (req.headers['content-encoding'] || 'identity').toLowerCase();
  let gzip, identity;

  switch (encoding) {
    case 'deflate':
      identity = req.pipe(zlib.createInflate());
      gzip = req.pipe(zlib.createInflate()).pipe(zlib.createGzip());
      break;
    case 'gzip':
    case 'x-gzip':
      identity = req.pipe(zlib.createGunzip());
      gzip = req;
      break;
    case 'identity':
      identity = req;
      gzip = req.pipe(zlib.createGzip());
      break;
  }

  if(gzip && identity) {
    res.locals.requestStreams = {
        gzip,
        identity,
    };
    next();
  } else {
    console.warn('Unsupported');
    res.status(415).end('Unsupported content encoding "' + encoding + '"');
  }
}

module.exports = decode;
