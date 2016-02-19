'use strict';
/* global describe, it */

let assert = require('chai').assert,
    request = require('supertest'),
    Server = require('./server.js').Server,
    app = Server();

describe('Server', () => {
  it('Should have a model', () => {
    assert.isDefined(app.locals.model);
  });

  for(let path of ['/a', '/a/', '//']) {
    it('Should return 404 for non-existing path: ' + path, (done) => {
      request(app)
        .get(path)
        .expect(404, done);
    });
  }
});

