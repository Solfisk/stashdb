'use strict';
/* global describe, it */

const assert = require('chai').assert,
      request = require('supertest'),
      App = require('../fixture/app.fixture.js').App,
      ResourceRaw = require('./resource-raw.js').ResourceRaw;

App((app) => {
  app.use(ResourceRaw());

  describe('Resources', () => {

    describe('Handling content types', () => {
      it('Should refuse to serve content types that the client does not accept', (done) => {
        request(app)
          .get('/a')
          .set('Accept', 'x-unavailable/nada')
          .expect(406)
          .end(done);
      });
    });
/*

    describe('Manipulating collections', () => {

      function save(done, path, id) {
        request(app)
          .put(path)
          .set('Content-Type', 'application/json')
          .send('{"a": {"b": ' + id + '}}')
          .expect(204, done);
      }

      function exists(done, path, id) {
        request(app)
          .get(path + 'a')
          .expect('Content-Type', 'application/json; charset=utf-8')
          .expect('Content-Encoding', 'gzip')
          .expect((res) => {
            assert.deepEqual(res.body, {"b": id});
          })
          .expect(200, done);
      }

      function collectionExists(done, path) {
        request(app)
          .get(path)
          .expect('Content-Type', 'application/json; charset=utf-8')
   //       .expect('Content-Encoding', 'gzip')
          .expect((res) => {
            assert.deepEqual(res.body, {"a": path + 'a'});
          })
          .expect(200, done);
      }

      function remove(done, path) {
        request(app)
          .delete(path)
          .expect(204, done);
      }

      function gone(done, path) {
        request(app)
          .get(path)
          .expect(404, done);
      }
      for(let path of ['/a/', '/x/y/z/']) {
        it('Should be able to create collection: ' + path, (done) => { save(done, path, 1) });
        it('Should be able to GET newly created collection: ' + path, (done) => { collectionExists(done, path) });
        it('Should be able to GET a member of the newly created collection: ' + path, (done) => { exists(done, path, 1) });
        it('Should be able to replace collection: ' + path, (done) => { save(done, path, 2) });
        it('Should be able to GET replaced collection: ' + path, (done) => { exists(done, path, 2) });
        it('Should be able to DELETE collection: ' + path, (done) => { remove(done, path) });
        it('Should not be able to GET: ' + path, (done) => { gone(done, path) });

      }
    });

    it('Should be able to return collections and resources', () => {
      let model = app.get('model');

    });
  */
  });
});

