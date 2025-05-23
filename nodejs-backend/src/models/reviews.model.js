
    module.exports = function (app) {
        const modelName = 'reviews';
        const mongooseClient = app.get('mongooseClient');
        const { Schema } = mongooseClient;
        const schema = new Schema(
          {
            bookingId: { type: Schema.Types.ObjectId, ref: "bookings" },
customerId: { type: Schema.Types.ObjectId, ref: "users" },
providerId: { type: Schema.Types.ObjectId, ref: "users" },
rating: { type: Number, required: false, max: 10000000 },
comment: { type:  String , required: true },

            
            createdBy: { type: Schema.Types.ObjectId, ref: "users", required: true },
            updatedBy: { type: Schema.Types.ObjectId, ref: "users", required: true }
          },
          {
            timestamps: true
        });
      
       
        if (mongooseClient.modelNames().includes(modelName)) {
          mongooseClient.deleteModel(modelName);
        }
        return mongooseClient.model(modelName, schema);
        
      };