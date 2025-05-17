const assert = require('assert');
const app = require('../../src/app');

describe('\'bookings\' service', () => {
  it('registered the service', () => {
    const service = app.service('bookings');

    assert.ok(service, 'Registered the service (bookings)');
  });
});
