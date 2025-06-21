module.exports = function (app) {
    const modelName = 'listings';
    const mongooseClient = app.get('mongooseClient');
    const { Schema } = mongooseClient;
    const schema = new Schema(
      {
        providerId: { type: Schema.Types.ObjectId, ref: "users" },
        category: { type:  String , required: true },
        name: { type:  String , required: true },
        description: { type:  String , required: true },
        pricerange: { type:  String , required: true },
        location: { type:  String , required: true },
        whatsappLink: { type:  String , required: true },
        imageUrl: { type: String, required: true },
        availability: { type: Object },
        startTime: { type: String },
        endTime: { type: String },
        leadTime: { type: String },
        createdBy: { type: Schema.Types.ObjectId, ref: "users", required: false },
        updatedBy: { type: Schema.Types.ObjectId, ref: "users", required: false },
        rating: { type: Number, default: null }
      },
      {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    });

    if (mongooseClient.modelNames().includes(modelName)) {
      mongooseClient.deleteModel(modelName);
    }
    return mongooseClient.model(modelName, schema);
  };