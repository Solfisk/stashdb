'use strict';
/* global describe, it */

const assert = require('chai').assert,
      request = require('supertest'),
      app = require('../../fixture/app.fixture.js').App(),
      Resource = require('../../model.js').Resource,
      parseLinkHeader = require('parse-link-header');

app.use(require('../../middleware/init.js'), require('./raw.js'), require('../delete-any.js'));

describe('Collection using raw', () => {
  it('Should handle GET / upon initialization', (done) => {
    request(app)
      .get('/?get')
      .expect(200, done);
  });

  it('Should have a revision header', (done) => {
    request(app)
      .get('/?get')
      .expect('Revision', /^\d+$/)
      .expect('Resource-Revision', /^\d+$/)
      .expect(200, done);
  });

  describe('Paging', () => {
    it('Should ignore the pageSize parameter', (done) => {
      app.locals.model.fixture.newCollection('/paging/');
      for(let i=1; i<4; i++) {
        app.locals.model.fixture.setPlain('/paging/' + i, i);
      }
      request(app)
        .get('/paging/?get&pageSize=2')
        .expect(400, done);
    });
    it('Should handle out of bounds revision page parameters', (done) => {
      request(app)
        .get('/paging/?get&page=-1&fromRevision=0&toRevision=3')
        .expect(400, done);
    });
    it('Should be possible to page through the collection', (done) => {
      const test = (link, run) => {
        request(app)
          .get(link)
          .expect(200)
          .expect('content: ' + run)
          .end((err, res) => {
            if(err) {
              return done(err);
            } else {
              const next = parseLinkHeader(res.headers.link).next;
              if(next) {
                test(next.url, ++run);
              } else {
                done();
              }
            }
        });
      };
      test('/paging/?get&pageSize=1', 1);
    });
  });
});

