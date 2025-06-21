const { authenticate } = require("@feathersjs/authentication").hooks;

const setProviderId = async (context) => {
  const { data, params } = context;
  if (params.user) {
    context.data = {
      ...data,
      providerId: params.user._id,
    };
  }
  return context;
};

const filterByProvider = async (context) => {
  const { params } = context;
  if (params.user && params.user.role === 'provider') {
    params.query = {
      ...params.query,
      providerId: params.user._id,
    };
  }
  return context;
};

module.exports = {
  before: {
    all: [authenticate("jwt")],
    find: [filterByProvider],
    get: [filterByProvider],
    create: [setProviderId],
    update: [filterByProvider],
    patch: [filterByProvider],
    remove: [filterByProvider],
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },
};
