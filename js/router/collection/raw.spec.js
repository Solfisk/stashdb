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
    app.locals.model.fixture.newCollection('/paging/');
    for(let i=1; i<4; i++) {
      app.locals.model.fixture.setPlain('/paging/' + i, i);
    }
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
                  if(run == 3) {
                    // Finished
                    request(app)
                      .get(next.url)
                      .expect(204, done);
                  } else {
                    // Keep testing
                    test(next.url, ++run);
                  }
                } else {
                  done('No next link! This must be in every response from raw resource handler.');
                }
              }
          });
        };
        test('/paging/?get', 1);
    });

    it('Should be possible to pick up new items that were added after paging started', (done) => {
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
                if(run === 1) {
                  app.locals.model.fixture.setPlain('/paging/4', 4);
                }
                if(run == 4) {
                  // Finished
                  request(app)
                    .get(next.url)
                    .expect(204, done);
                } else {
                  // Keep testing
                  test(next.url, ++run);
                }
              } else {
                done('No next link! This must be in every response from raw resource handler.');
              }
            }
        });
      };
      test('/paging/?get', 1);
    });

    it('Should be possible to get 204 for deleted items when paging with get', (done) => {
      const test = (link, run) => {
        request(app)
          .get(link)
          .expect(200)
          .expect('content: ' + run)
          .end((err, res) => {
            if(err) {
              return done(err);
            } else {
              const links = parseLinkHeader(res.headers.link),
                    next = links.next;
              if(next) {
                if(run === 1) {
                  assert.isDefined(links.resource);
                  app.locals.model.fixture.delete(links.resource.url);
                }
                if(run == 4) {
                  // Finished
                  request(app)
                    .get(next.url)
                    .expect('Name', '1')
                    .expect(204, done);
                } else {
                  // Keep testing
                  test(next.url, ++run);
                }
              } else {
                done('No next link! This must be in every response from raw resource handler.');
              }
            }
        });
      };
      test('/paging/?get', 1);
    });
    /*
    it('Should be possible to get 204 for deleted items when paging with get', (done) => {
      const test = (link, run) => {
        request(app)
          .get(link)
          .expect(200)
          .expect('content: ' + run)
          .end((err, res) => {
            console.log(res.headers);
            if(err) {
              return done(err);
            } else {
              const next = parseLinkHeader(res.headers.link).next;
              if(next) {
                if(run === 4) {
                  console.log('DELETE');
                  const paging = app.locals.model.get('/paging/');
                  app.locals.model.fixture.delete('/paging/4');
                }
                test(next.url, ++run);
              } else {
                assert.equal(run, 4);
                done();
              }
            }
        });
      };
      test('/paging/?get&pageSize=1', 1);
    });
    */
  });
});

