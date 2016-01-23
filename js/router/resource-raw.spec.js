'use strict';
/* global describe, it */

const assert = require('chai').assert,
      request = require('supertest'),
      app = require('../fixture/app.fixture.js').App(),
      ResourceRaw = require('./resource-raw.js').ResourceRaw,
      DeleteAny = require('./delete-any.js').DeleteAny;

app.use(ResourceRaw(), DeleteAny());

describe('Resources', () => {

  describe('Handling content types', () => {
    it('Should refuse to serve content types that the client does not accept!', (done) => {
      request(app)
        .get('/a')
        .set('Accept', 'x-unavailable/nada')
        .expect(406, done);
    });
  });

  describe('Manipulating resources', () => {
    function save(path, id) {
      return (done) => {
        request(app)
          .put(path)
          .set('Content-Type', 'text/plain')
          .send('content: ' + path + ':' + id)
          .expect(204, done);
      };
    }

    function exists(path, id) {
      return (done) => {
        request(app)
          .get(path)
          .expect('Content-Type', 'text/plain; charset=utf-8')
          .expect('Content-Encoding', 'gzip')
          .expect('content: ' + path + ':' + id)
          .expect(200, done);
      };
    }

    function remove(path) {
      return (done) => {
        request(app)
          .delete(path)
          .expect(204, done);
      };
    }

    function gone(path) {
      return (done) => {
        request(app)
          .get(path)
          .expect(404, done);
      };
    }

    for(let path of ['/a', '/x/y']) {
      it('Should be able to create resource: ' + path, save(path, 1));
      it('Should be able to GET newly created resource: ' + path, exists(path, 1));
      it('Should be able to replace resource: ' + path, save(path, 2));
      it('Should be able to GET replaced resource: ' + path, exists(path, 2));
      it('Should be able to DELETE resource: ' + path, remove(path));
      it('Should not be able to GET: ' + path, gone(path));
    }
  });

});

