const { Service } = require('feathers-mongoose');

exports.Listings = class Listings extends Service {
    async find(params) {
        const result = await super.find(params);

        const { user } = params;

        if (user && result.data && result.data.length > 0) {
            const userId = user._id.toString();
            result.data.forEach(listing => {
                if (listing.favoritedBy && listing.favoritedBy.map(id => id.toString()).includes(userId)) {
                    listing.isFavorite = true;
                }
            });
        }

        return result;
    }

    constructor(options, app) {
      super(options);
      this.app = app;
    }
};