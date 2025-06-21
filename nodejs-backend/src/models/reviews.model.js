module.exports = function (app) {
    const modelName = 'reviews';
    const mongooseClient = app.get('mongooseClient');
    const { Schema } = mongooseClient;
    const schema = new Schema(
      {
        bookingId: { type: Schema.Types.ObjectId, ref: "bookings", required: true },
        listingId: { type: Schema.Types.ObjectId, ref: "listings", required: true },
        customerId: { type: Schema.Types.ObjectId, ref: "users", required: true },
        providerId: { type: Schema.Types.ObjectId, ref: "users", required: true },
        rating: { 
          type: Number, 
          required: true, 
          min: 1, 
          max: 5,
          validate: {
            validator: Number.isInteger,
            message: 'Rating must be a whole number between 1 and 5'
          }
        },
        comment: { 
          type: String, 
          required: true,
          minLength: [10, 'Review must be at least 10 characters long'],
          maxLength: [1000, 'Review cannot exceed 1000 characters']
        },
        status: {
          type: String,
          enum: ['active', 'hidden', 'deleted'],
          default: 'active'
        },
        createdBy: { type: Schema.Types.ObjectId, ref: "users", required: true },
        updatedBy: { type: Schema.Types.ObjectId, ref: "users", required: true }
      },
      {
        timestamps: true
    });
  
    // Add indexes for better query performance
    schema.index({ bookingId: 1 });
    schema.index({ listingId: 1 });
    schema.index({ customerId: 1 });
    schema.index({ providerId: 1 });
    schema.index({ status: 1 });
    schema.index({ rating: 1 });
   
    if (mongooseClient.modelNames().includes(modelName)) {
      mongooseClient.deleteModel(modelName);
    }
    return mongooseClient.model(modelName, schema);
};