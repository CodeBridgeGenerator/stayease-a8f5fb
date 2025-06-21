const mongoose = require('mongoose');
require('dotenv').config();

async function dropIndexes() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/stayease', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    // Get the users collection
    const usersCollection = mongoose.connection.collection('users');

    // Drop all indexes except _id
    await usersCollection.dropIndexes();
    console.log('All indexes dropped successfully');

    // Create our required indexes
    await usersCollection.createIndex({ email: 1 }, { unique: true });
    await usersCollection.createIndex({ status: 1 });
    console.log('Required indexes created successfully');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

dropIndexes(); 