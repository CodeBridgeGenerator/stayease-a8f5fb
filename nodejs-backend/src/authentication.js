const {
    AuthenticationService,
    JWTStrategy
} = require('@feathersjs/authentication');
const { LocalStrategy } = require('@feathersjs/authentication-local');
const { expressOauth } = require('@feathersjs/authentication-oauth');
const logAuthEvents = require('./hooks/logAuthEvents');
// const { OAuthStrategy } = require('@feathersjs/authentication-oauth');

// class GoogleStrategy extends OAuthStrategy {
//   async getEntityData(profile) {
//     // this will set 'googleId'
//     const baseData = await super.getEntityData(profile);

//     // this will grab the picture and email address of the Google profile
//     return {
//       ...baseData,
//       profilePicture: profile.picture,
//       email: profile.email,
//     };
//   }
// }

module.exports = (app) => {
    const authentication = new AuthenticationService(app);

    authentication.register('jwt', new JWTStrategy());
    authentication.register('local', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        entity: 'user',
        service: 'users',
        errorMessage: 'Invalid login credentials',
        entityUsernameField: 'email',
        entityPasswordField: 'password',
        authStrategies: ['jwt', 'local']
    }));
    //authentication.register('google', new GoogleStrategy());

    app.use('/authentication', authentication);
    app.configure(expressOauth());

    // Add hooks to the authentication service
    const authService = app.service('authentication');
    authService.hooks({
        before: {
            create: [
                async context => {
                    // Convert email to lowercase
                    if (context.data.email) {
                        context.data.email = context.data.email.toLowerCase();
                    }
                    return context;
                }
            ]
        },
        after: {
            all: [logAuthEvents()]
        }
    });

    // Configure the authentication service
    app.set('authentication', {
        entity: 'user',
        service: 'users',
        secret: process.env.FEATHERS_AUTH_SECRET || 'your-secret-key',
        authStrategies: ['jwt', 'local'],
        local: {
            usernameField: 'email',
            passwordField: 'password'
        }
    });
};
