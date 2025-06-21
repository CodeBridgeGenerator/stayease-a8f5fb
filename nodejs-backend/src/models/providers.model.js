module.exports = function (app) {
    const modelName = 'providers';
    const mongooseClient = app.get('mongooseClient');
    const { Schema } = mongooseClient;
    const schema = new Schema(
      {
        providerId: { type: Schema.Types.ObjectId, ref: "users" },
        // 1. Basic Info
        name: { type: String, required: true }, // Full Name or Business Name
        email: { type: String, required: true },
        phone: { type: String },
        imageUrl: { type: String }, // Profile picture
        // 2. Service Details
        businessName: { type: String },
        category: { type: [String], required: true }, // Array of categories
        location: { type: String, required: true }, // Service Coverage Area
        // 3. WhatsApp Contact Settings
        whatsappLink: { type: String },
        bookingMsg: { type: String },
        // 4. Availability Status
        available: { type: Boolean, default: true },
        // 5. Service Provider Description / Bio
        description: { type: String }, // About Your Business
        experience: { type: String },
        certifications: { type: String },
        // 6. Password Management (not stored here, handled by users collection)
      },
      {
        timestamps: true
    });

    if (mongooseClient.modelNames().includes(modelName)) {
      mongooseClient.deleteModel(modelName);
    }
    return mongooseClient.model(modelName, schema);
  };