const { NotFound } = require('@feathersjs/errors');

exports.ToggleFavorite = class ToggleFavorite {
  constructor(app) {
    this.app = app;
  }

  async create(data, params) {
    const { listingId } = data;
    const { user } = params;
    const listingsService = this.app.service('listings');

    const listing = await listingsService.get(listingId);

    if (!listing) {
      throw new NotFound('Listing not found');
    }

    const favoritedBy = listing.favoritedBy.map(id => id.toString());
    const userId = user._id.toString();
    const userIndex = favoritedBy.indexOf(userId);

    if (userIndex > -1) {
      // User has already favorited, so remove
      favoritedBy.splice(userIndex, 1);
    } else {
      // User has not favorited, so add
      favoritedBy.push(userId);
    }

    const updatedListing = await listingsService.patch(listingId, { favoritedBy });
    
    // We can return a simple success message or the updated status
    return { isFavorite: userIndex === -1 };
  }
}; 