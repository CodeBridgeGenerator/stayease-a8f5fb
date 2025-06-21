module.exports = function (app) {
  const modelName = "profiles";
  const mongooseClient = app.get("mongooseClient");
  const { Schema } = mongooseClient;
  const schema = new Schema(
    {
      name: {
        type: String,
        required: true,
        unique: false,
        lowercase: false,
        uppercase: false,
        index: false,
        trim: false,
      },
      userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "users",
      },
      image: {
        type: String,
        required: false,
        unique: false,
        lowercase: false,
        uppercase: false,
        index: false,
        trim: false,
      },
      bio: {
        type: String,
        required: false,
        unique: false,
        lowercase: false,
        uppercase: false,
        minLength: 0,
        maxLength: 1000000,
        index: true,
        trim: true,
      },
      department: { type: Schema.Types.ObjectId, ref: "departments" },
      hod: { type: Boolean, required: true, default: false },
      section: { type: Schema.Types.ObjectId, ref: "sections" },
      hos: { type: Boolean, required: true, default: false },
      role: { type: Schema.Types.ObjectId, required: false, ref: "roles" },
      position: {
        type: Schema.Types.ObjectId,
        required: false,
        ref: "positions",
      },
      manager: { type: Schema.Types.ObjectId, ref: "users" },
      company: { type: Schema.Types.ObjectId, ref: "companies" },
      branch: { type: Schema.Types.ObjectId, ref: "branches" },
      skills: {
        type: [String],
        required: false,
        unique: false,
        lowercase: false,
        uppercase: false,
        minLength: 3,
        maxLength: 100000000,
        index: true,
        trim: true,
      },
      address: { type: Schema.Types.ObjectId, ref: "user_addresses" },
      phone: { type: Schema.Types.ObjectId, ref: "user_phones" },
      homestays: [
        {
          name: { type: String, required: true },
          address: { type: String, required: true },
          propertyType: { type: String, required: true },
          numberOfUnits: { type: Number, required: true }
        }
      ],
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
