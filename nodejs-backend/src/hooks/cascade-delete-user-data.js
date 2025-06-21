module.exports = function cascadeDeleteUserData() {
  return async context => {
    const userId = context.id;
    // Remove all bookings by this user (as customer or provider)
    await context.app.service('bookings').remove(null, {
      query: { $or: [{ customerId: userId }, { providerId: userId }] }
    });
    // Remove all reviews by this user
    await context.app.service('reviews').remove(null, {
      query: { customerId: userId }
    });
    // Add more related collections as needed
    return context;
  };
}; 