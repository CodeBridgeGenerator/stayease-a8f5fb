
    module.exports = function (app) {
        const modelName = 'providers';
        const mongooseClient = app.get('mongooseClient');
        const { Schema } = mongooseClient;
        const schema = new Schema(
          {
            providerId: { type: Schema.Types.ObjectId, ref: "users" },
category: { type:  String , required: true, maxLength: null },
name: { type:  String , required: true, maxLength: null },
description: { type:  String , required: true, maxLength: null },
priceRange: { type:  String , required: true, minLength: null, maxLength: null },
location: { type:  String , required: true, minLength: null, maxLength: null },
whatsappLink: { type:  String , required: true, minLength: null, maxLength: null },
imageUrl: { type:  String , required: true, minLength: null, maxLength: null },

            
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