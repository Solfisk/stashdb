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

  it('Should return 404 for non-existing paths', () => {
    request(app)
      .get('/a')
      .expect(404);

    request(app)
      .get('/a/')
      .expect(404);

    request(app)
      .get('//')
      .expect(404);
  });
});

