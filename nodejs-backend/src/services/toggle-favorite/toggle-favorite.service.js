const { ToggleFavorite } = require('./toggle-favorite.class');
const hooks = require('./toggle-favorite.hooks');

module.exports = function (app) {
  app.use('/toggle-favorite', new ToggleFavorite(app));
  const service = app.service('toggle-favorite');
  service.hooks(hooks);
}; 