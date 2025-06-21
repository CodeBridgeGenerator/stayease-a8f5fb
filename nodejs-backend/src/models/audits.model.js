module.exports = function (app) {
  const modelName = "audits";
  const mongooseClient = app.get("mongooseClient");
  const { Schema } = mongooseClient;
  const schema = new Schema(
    {
      serviceName: { type: String, required: true, default: 'bookings' },
      action: { type: String, required: true }, // e.g., 'status_change', 'new_booking', 'review_left'
      providerId: { type: Schema.Types.ObjectId, ref: "users" },
      customerId: { type: Schema.Types.ObjectId, ref: "users" },
      bookingId: { type: Schema.Types.ObjectId, ref: "bookings" },
      listingId: { type: Schema.Types.ObjectId, ref: "listings" },
      meta: { type: Object }, // For storing extra data like { from: 'pending', to: 'confirmed' } or { rating: 5 }
      message: { type: String }, // Human-readable message, e.g., "Booking status changed to Confirmed"
    },
    {
      timestamps: true,
    },
  );

  if (mongooseClient.modelNames().includes(modelName)) {
    mongooseClient.deleteModel(modelName);
  }
  return mongooseClient.model(modelName, schema);
};
