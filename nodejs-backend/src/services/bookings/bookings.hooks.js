const { authenticate } = require('@feathersjs/authentication').hooks;
const { NotAuthenticated } = require('@feathersjs/errors');

const createAudit = async (context) => {
    const { app, result, data, method, path } = context;
    const audits = app.service('audits');

    if (method === 'create') {
        await audits.create({
            serviceName: path,
            action: 'new_booking',
            providerId: result.providerId,
            customerId: result.customerId,
            bookingId: result._id,
            listingId: result.listingId,
            message: `New booking created for listing ${result.listingId}.`,
        });
    }

    if (method === 'patch' && data.status) {
        const booking = await app.service('bookings').get(result._id);
        await audits.create({
            serviceName: path,
            action: 'status_change',
            providerId: booking.providerId,
            customerId: booking.customerId,
            bookingId: booking._id,
            listingId: booking.listingId,
            meta: { to: data.status },
            message: `Booking status changed to ${data.status}.`,
        });
    }
    
    if (method === 'patch' && data.rating) {
        const booking = await app.service('bookings').get(result._id);
        await audits.create({
            serviceName: path,
            action: 'review_left',
            providerId: booking.providerId,
            customerId: booking.customerId,
            bookingId: booking._id,
            listingId: booking.listingId,
            meta: { rating: data.rating, comment: data.comment },
            message: `New review was left with ${data.rating} stars.`,
        });
    }

    return context;
};

const restrictAccess = async (context) => {
    const { params, app } = context;
    const { query = {} } = params;

    // Allow public queries for ratings (from ServicesPage)
    if (query.rating || (query.listingId && query.$select)) {
        return context;
    }

    // For all other queries, we require authentication.
    // We call the authenticate hook here to ensure user is logged in.
    await authenticate('jwt')(context);

    const { user } = context.params;

    // Admins can see all bookings without restriction
    if (user.role === 'admin') {
        return context;
    }
    
    // If a specific booking is requested by its ID, allow it (permissions can be checked in 'get' hook or an 'after' hook)
    if(query._id) {
        return context;
    }
    
    // For a general query, filter by the user's role.
    // This covers the "My Bookings" page scenario.
    if (user.role === 'customer') {
        context.params.query.customerId = user._id;
    }

    if (user.role === 'provider') {
        context.params.query.providerId = user._id;
    }
    
    return context;
}

module.exports = {
    before: {
        all: [],
        find: [restrictAccess],
        get: [authenticate('jwt')],
        create: [authenticate('jwt')],
        update: [authenticate('jwt')],
        patch: [authenticate('jwt')],
        remove: [authenticate('jwt')]
    },

    after: {
        all: [],
        find: [],
        get: [],
        create: [createAudit],
        update: [],
        patch: [createAudit],
        remove: []
    },

    error: {
        all: [],
        find: [],
        get: [],
        create: [],
        update: [],
        patch: [],
        remove: []
    }
};
