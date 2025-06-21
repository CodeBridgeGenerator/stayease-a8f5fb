module.exports = function (app) {
  const modelName = "favorites";
  const mongooseClient = app.get("mongooseClient");
  const { Schema } = mongooseClient;
  const schema = new Schema(
    {
      userId: { type: Schema.Types.ObjectId, ref: "users", required: true },
      serviceId: { type: Schema.Types.ObjectId, ref: "listings", required: true },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    },
    { timestamps: true }
  );

  // Create a compound index to ensure a user can't favorite the same service twice
  schema.index({ userId: 1, serviceId: 1 }, { unique: true });

  if (mongooseClient.modelNames().includes(modelName)) {
    mongooseClient.deleteModel(modelName);
  }
  return mongooseClient.model(modelName, schema);
}; 