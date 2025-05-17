
    module.exports = function (app) {
        const modelName = 'bookings';
        const mongooseClient = app.get('mongooseClient');
        const { Schema } = mongooseClient;
        const schema = new Schema(
          {
            listingId: { type: Schema.Types.ObjectId, ref: "listings" },
customerId: { type: Schema.Types.ObjectId, ref: "users" },
providerId: { type: Schema.Types.ObjectId, ref: "users" },
bookingDate: { type: Date, required: false },
status: { type:  String , required: true },
notes: { type:  String , required: true },

            
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