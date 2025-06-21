module.exports = function (app) {
  const modelName = "customers";
  const mongooseClient = app.get("mongooseClient");
  const { Schema } = mongooseClient;
  const schema = new Schema(
    {
      userId: { type: Schema.Types.ObjectId, ref: "users", required: true },
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String },
      imageUrl: { type: String },
      bio: { type: String },
      location: { type: String },
      homestays: [
        {
          name: String,
          location: String,
          numberOfUnit: Number,
        }
      ],
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    },
    { timestamps: true }
  );

  if (mongooseClient.modelNames().includes(modelName)) {
    mongooseClient.deleteModel(modelName);
  }
  return mongooseClient.model(modelName, schema);
}; 