'use strict';
/* global describe, it */

const assert = require('chai').assert;
const request = require('supertest');
const express = require('express');
const zlib = require('zlib');
const Readable = require('stream').Readable;
const Transform = require('readable-stream').Transform;
const bl = require('bl');

const identityTransformer = () => {
  const result = new Transform();
  result._transform = (chunk, encoding, cb) => { result.push(chunk); cb(); };
  return result;
};

const encodingTypes = {
  gzip: zlib.createGzip,
  'x-gzip': zlib.createGzip,
  deflate: zlib.createDeflate,
  identity: identityTransformer
};

const decodingTypes = {
  gzip: zlib.createGunzip,
  identity: identityTransformer
};

function testInputStream() {
  const stream = new Readable();
  stream._read = () => {};
  stream.push('test input');
  stream.push(null);
  return stream;
}

describe('Middleware', () => {
  describe('Decode', () => {
    it('Can be required', () => assert(require('./decode')));
    const decode = require('./decode');
    function testPair(fromEncoding, toEncoding) {
      it(`Can decode ${fromEncoding} to ${toEncoding}`, done => {
        const app = express()
          .use(decode)
          .use((req, res) => {
            assert.instanceOf(res.locals.requestStreams[toEncoding], Readable, `Has ${toEncoding} stream`);
            
            res.locals.requestStreams[toEncoding]
              .pipe(decodingTypes[toEncoding]())
              .pipe(bl((err, data) => {
                assert.equal(data, 'test input', `Decoded ${toEncoding} stream contains original payload`);
                done();
              }));
          });
        const req = request(app).put('/').set('Content-Type', 'text/plain').set('Content-Encoding', fromEncoding);
        testInputStream().pipe(encodingTypes[fromEncoding]()).pipe(req);
      });
    }
    for(let encoding in encodingTypes) {
      testPair(encoding, 'gzip');
      testPair(encoding, 'identity');
    }
  });
});
