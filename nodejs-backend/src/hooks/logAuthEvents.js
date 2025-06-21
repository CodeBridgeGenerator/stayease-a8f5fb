const { getItems } = require('feathers-hooks-common');

module.exports = function (options = {}) {
  return async context => {
    const { app, method, service, path } = context;
    const items = getItems(context);

    // Only handle authentication service events
    if (path === 'authentication') {
      const auditService = app.service('audits');
      const details = {
        accessToken: items.accessToken,
        authentication: items.authentication,
        user: items.user
      };

      // Get user email from either the items or the authentication payload
      let userEmail = 'system';
      if (items.user && items.user.email) {
        userEmail = items.user.email;
      } else if (items.authentication && items.authentication.payload) {
        // For logout, try to get the email from the existing user
        try {
          const userService = app.service('users');
          const user = await userService.get(items.authentication.payload.sub);
          if (user && user.email) {
            userEmail = user.email;
          }
        } catch (error) {
          console.log('Could not fetch user email for audit log:', error);
        }
      }

      // Create audit entry
      await auditService.create({
        serviceName: 'authentication',
        action: method === 'remove' ? 'remove' : 'create',
        details: JSON.stringify(details),
        createdBy: userEmail,
        method: method
      });
    }

    return context;
  };
}; 