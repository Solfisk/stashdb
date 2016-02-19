'use strict';
/* global describe, it */

const assert = require('chai').assert,
      request = require('supertest'),
      app = require('../fixture/app.fixture.js').App(),
      ResourceRaw = require('./resource-raw.js').ResourceRaw,
      DeleteAny = require('./delete-any.js').DeleteAny,
      series = require('async').series;

app.use(ResourceRaw(), DeleteAny());


describe('Resources', () => {

  describe('Handling content types', () => {

    describe('Invalid accept headers', () => {
      for(let headers of [
          {'Accept': 'image/jpeg'},
          {'Accept': 'text/plain',
           'Accept-Charset': 'nonexistent'}
        ]) {
        it('Should return 406 on Accept ' + headers.Accept + ' and Accept-Charset ' + (headers['Accept-Charset'] || 'unset'), (done) => {
            request(app)
              .get('/a')
              .set(headers)
              .expect(406, done);
        });
      }
    });

    describe('Valid accept headers', () => {
      for(let headers of [
          {'Accept': 'text/plain'},
          {'Accept': 'text/plain',
           'Accept-Charset': 'utf-8'},
          {'Accept': 'text/plain',
           'Accept-Charset': '*'},
          {'Accept': '*/*',
           'Accept-Charset': 'utf-8'},
          {'Accept': '*/*'}
        ]) {
        it('Should return 200 on Accept ' + headers.Accept + ' and Accept-Charset ' + (headers['Accept-Charset'] || 'unset'), (done) => {
            request(app)
              .get('/a')
              .set(headers)
              .expect(200, done);
        });
      }
    });

    describe('Parsing charset from Content-Type header', () => {
      for(let test of [
          [{'Content-Type': 'application/json'}, 'utf-8', 'application/json; charset=utf-8'],
          [{'Content-Type': 'application/json; charset=utf-8'}, 'utf-8', 'application/json; charset=utf-8'],
          [{'Content-Type': 'text/plain'}, 'utf-8', 'text/plain; charset=utf-8'],
          [{'Content-Type': 'text/html'}, 'utf-8', 'text/html; charset=utf-8'],
          [{'Content-Type': 'text/plain; charset=utf-8'}, 'utf-8', 'text/plain; charset=utf-8'],
          [{'Content-Type': 'text/plain; charset=latin1'}, 'latin1', 'text/plain; charset=latin1'],
          [{'Content-Type': 'image/jpg'}, undefined, 'image/jpg']
        ]) {
          describe('Sending ' + test[0]['Content-Type'], () => {
            it('Should be able to receive Content-Type ' + test[0]['Content-Type'], (done) => {
              request(app)
                .put('/charset')
                .set(test[0])
                .send('[]') // Superagent will try parsing any json sent, so it has to be JSON content for this test to work
                .expect(204, done);
            });
            it('Should be able to serve the newly saved resource', (done) => {
              request(app)
                .get('/charset')
                .expect(200, done);
            });
            it('Should have the right charset on the newly saved resource with', (done) => {
              request(app)
                .get('/charset')
                .expect('Content-Type', test[2])
                .expect(200, done);
            });
          });
      }
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

