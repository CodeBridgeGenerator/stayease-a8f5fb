const mongoose = require('mongoose');
const logger = require('./logger');

if (!process.env.MONGODB_URL)
    throw { message: "Environmental variable 'MONGODB_URL' is required." };

if (!process.env.MAIL_MAILER)
    throw { message: "Environmental variable 'MAIL_MAILER' is required." };

if (!process.env.MAIL_HOST)
    throw { message: "Environmental variable 'MAIL_HOST' is required." };

if (!process.env.MAIL_PORT)
    throw { message: "Environmental variable 'MAIL_PORT' is required." };

if (!process.env.MAIL_USERNAME)
    throw { message: "Environmental variable 'MAIL_USERNAME' is required." };

if (!process.env.MAIL_PASSWORD)
    throw { message: "Environmental variable 'MAIL_PASSWORD' is required." };

if (!process.env.MAIL_ENCRYPTION)
    throw { message: "Environmental variable 'MAIL_ENCRYPTION' is required." };

module.exports = function (app) {
    const mongooseOptions = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
    };

    mongoose.connect(process.env.MONGODB_URL, mongooseOptions)
        .then(() => {
            logger.info('Connected to MongoDB successfully');
        })
        .catch((err) => {
            logger.error('MongoDB connection error:', err);
            process.exit(1);
        });

    // Add connection event listeners
    mongoose.connection.on('error', (err) => {
        logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
        logger.info('MongoDB reconnected');
    });

    mongoose.set('strictQuery', false);
    app.set('mongooseClient', mongoose);
};
