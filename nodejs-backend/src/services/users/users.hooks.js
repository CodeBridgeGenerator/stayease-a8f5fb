const { authenticate } = require("@feathersjs/authentication").hooks;
const { hashPassword, protect } =
  require("@feathersjs/authentication-local").hooks;
const cascadeDeleteUserData = require('../../hooks/cascade-delete-user-data');

module.exports = {
  before: {
    all: [],
    find: [],
    get: [authenticate("jwt")],
    create: [
      async context => {
        const { data } = context;
        console.log('Creating user with data:', { ...data, password: '[REDACTED]' });
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
          console.log('Invalid email format:', data.email);
          throw new Error('Please enter a valid email address');
        }

        // Check if email already exists
        try {
          const existingUser = await context.service.find({
            query: {
              email: data.email.toLowerCase() // Convert to lowercase for case-insensitive check
            }
          });
          console.log('Existing user check result:', existingUser);

          if (existingUser.total > 0) {
            console.log('Email already exists:', data.email);
            throw new Error('This email is already registered');
          }
        } catch (error) {
          console.error('Error checking existing user:', error);
          throw error;
        }

        // Validate password length
        if (data.password.length < 6) {
          console.log('Password too short');
          throw new Error('Password must be at least 6 characters long');
        }

        // Convert email to lowercase
        data.email = data.email.toLowerCase();

        console.log('Validation passed, proceeding with user creation');
        return context;
      },
      hashPassword("password")
    ],
    update: [authenticate("jwt"), hashPassword("password")],
    patch: [hashPassword("password")],
    remove: [authenticate("jwt"), cascadeDeleteUserData()],
  },

  after: {
    all: [protect("password")],
    find: [],
    get: [],
    create: [
      async context => {
        console.log('User created successfully:', context.result);
        // Remove password from response
        delete context.result.password;
        // Auto-create profile if not exists
        const user = context.result;
        const profileService = context.app.service('profiles');
        const existing = await profileService.find({ query: { userId: user._id } });
        if (!existing.data.length) {
          await profileService.create({
            userId: user._id,
            name: user.name,
            image: user.image || '',
            bio: '',
            preferences: {},
            homestays: [],
          });
        }
        return context;
      }
    ],
    update: [],
    patch: [],
    remove: [],
  },

  error: {
    all: [
      async context => {
        console.error('Error in users service:', context.error);
        // Handle duplicate key error (MongoDB error code 11000)
        if (context.error.code === 11000) {
          if (context.error.keyPattern.email) {
            context.error.message = 'This email is already registered';
          } else {
            context.error.message = 'A user with these details already exists';
          }
        }
        return context;
      }
    ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },
};
