'use strict';
/* global describe, it */

const assert = require('chai').assert,
      request = require('supertest'),
      app = require('../fixture/app.fixture.js').App(),
      CollectionJson = require('./collection-json.js').CollectionJson,
      DeleteAny = require('./delete-any.js').DeleteAny,
      Resource = require('../model.js').Resource;

app.use(CollectionJson(), DeleteAny());

describe('Collection using Json', () => {
  it('Should handle GET / upon initialization', (done) => {
    request(app)
      .get('/')
      .expect(200, done);
  });

  describe('Manipulating collections', () => {

    function save(path) {
      return (done) => {
        request(app)
          .put(path)
          .set('Content-Type', 'application/json')
          .send('{"c": {"d": 1}}')
          .expect(204, done);
      };
    }

    function exists(path) {
      return (done) => {
        request(app)
          .get(path)
          .expect({"c": path + "c"})
          .expect(200, done);
      };
    }

    for(let path of ['/a/x/', '/x/y/z/']) {
      it('Should be able to create collection: ' + path, save(path));
      it('Should be able to GET newly created collection: ' + path, exists(path));
      it('Should have set the resource ' + path + 'c', () => {
        assert.isDefined(app.locals.model.get(path + 'c'));
        assert.instanceOf(app.locals.model.get(path + 'c'), Resource);
      });
    }

    describe('Working with collection history', () => {
      it('Should have a revision header', (done) => {
        request(app)
          .get('/')
          .expect('Collection-Revision', /^\d+$/)
          .expect(200, done);
      });
      it('Should increase revision numbers when PUTting new resources', (done) => {
        app.locals.model.fixture.newCollection('/collection-history/');
        app.locals.model.fixture.setPlain('/collection-history/a', 'a');
        app.locals.model.fixture.setPlain('/collection-history/b', 'b1');
        app.locals.model.fixture.setPlain('/collection-history/b', 'b2');
        request(app)
          .get('/collection-history/')
          .expect('Collection-Revision', 3)
          .expect(200, done);
      });
      it('Should return revisions since a given revision', (done) => {
        request(app)
          .get('/collection-history/?sinceRevision=3')
          .expect({b: "/collection-history/b"})
          .expect(200, done);
      });
      it('Should return no revisions if sinceRevision is invalid', (done) => {
        request(app)
          .get('/collection-history/?sinceRevision=a')
          .expect({})
          .expect(200, done);
      });
    });

  });
});

