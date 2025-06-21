const { authenticate } = require('@feathersjs/authentication').hooks;

async function updateListingAndBookingRating(context) {
    const review = context.result;
    const { app } = context;

    // Update booking's rating
    if (review.bookingId) {
        await app.service('bookings').patch(review.bookingId, { rating: review.rating });
    }

    // Get all reviews for this listing
    const allReviews = await app.service('reviews').find({
        query: { listingId: review.listingId }
    });

    // Calculate average rating
    const ratings = allReviews.data.map(r => r.rating);
    const avgRating = ratings.length
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length
        : null;

    // Update the listing's rating
    await app.service('listings').patch(review.listingId, { rating: avgRating });

    return context;
}

module.exports = {
    before: {
        all: [authenticate('jwt')],
        find: [],
        get: [],
        create: [
            async context => {
                // Set createdBy and updatedBy to the authenticated user
                context.data.createdBy = context.params.user._id;
                context.data.updatedBy = context.params.user._id;
                return context;
            }
        ],
        update: [
            async context => {
                context.data.updatedBy = context.params.user._id;
                return context;
            }
        ],
        patch: [
            async context => {
                context.data.updatedBy = context.params.user._id;
                return context;
            }
        ],
        remove: []
    },

    after: {
        all: [],
        find: [],
        get: [],
        create: [
            async context => {
                // Update the booking to mark it as reviewed
                const bookingId = context.result.bookingId;
                await context.app.service('bookings').patch(bookingId, {
                    hasReview: true,
                    reviewId: context.result._id,
                    updatedBy: context.params.user._id
                });
                await updateListingAndBookingRating(context);
                return context;
            }
        ],
        update: [],
        patch: [],
        remove: [
            async context => {
                // If review is deleted, update the booking
                const bookingId = context.result.bookingId;
                await context.app.service('bookings').patch(bookingId, {
                    hasReview: false,
                    reviewId: null,
                    updatedBy: context.params.user._id
                });
                return context;
            }
        ]
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
