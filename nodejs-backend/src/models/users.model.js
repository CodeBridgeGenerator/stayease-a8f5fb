module.exports = function (app) {
  const modelName = "users";
  const mongooseClient = app.get("mongooseClient");
  const { Schema } = mongooseClient;
  const schema = new Schema(
    {
      name: {
        type: String,
        required: [true, 'Name is required'],
        unique: false,
        lowercase: false,
        uppercase: false,
        minLength: [2, 'Name must be at least 2 characters long'],
        maxLength: [100, 'Name cannot exceed 100 characters'],
        index: true,
        trim: true,
      },
      email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        uppercase: false,
        minLength: [5, 'Email must be at least 5 characters long'],
        maxLength: [150, 'Email cannot exceed 150 characters'],
        index: true,
        trim: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address']
      },
      password: {
        type: String,
        required: [true, 'Password is required'],
        unique: false,
        lowercase: false,
        uppercase: false,
        minLength: [6, 'Password must be at least 6 characters long'],
        maxLength: [300, 'Password cannot exceed 300 characters'],
        index: true,
        trim: true,
      },
      status: { 
        type: Boolean, 
        required: false, 
        default: true 
      },
      lastLogin: {
        type: Date,
        default: null
      },
      role: {
        type: String,
        enum: ['customer', 'provider', 'admin'],
        default: 'customer'
      },
      image: {
        type: String,
        required: false,
        trim: true,
      },
    },
    {
      timestamps: true,
      toJSON: {
        transform: function(doc, ret) {
          delete ret.password; // Remove password when converting to JSON
          return ret;
        }
      }
    }
  );

  // Drop any existing indexes
  schema.indexes().forEach(index => {
    schema.index(index[0], { ...index[1], unique: false });
  });

  // Add our required indexes
  schema.index({ email: 1 }, { unique: true });
  schema.index({ status: 1 });

  if (mongooseClient.modelNames().includes(modelName)) {
    mongooseClient.deleteModel(modelName);
  }
  return mongooseClient.model(modelName, schema);
};
