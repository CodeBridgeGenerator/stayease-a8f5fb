const { Service } = require("feathers-mongoose");
const createModel = require("../../models/customers.model");
const hooks = require("./customers.hooks");

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    paginate: app.get("paginate"),
  };

  app.use("/customers", new Service(options));
  const service = app.service("customers");
  service.hooks(hooks);
}; 