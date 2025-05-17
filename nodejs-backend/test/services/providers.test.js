const assert = require('assert');
const app = require('../../src/app');

describe('\'providers\' service', () => {
  it('registered the service', () => {
    const service = app.service('providers');

    assert.ok(service, 'Registered the service (providers)');
  });
});
