const _ = require('lodash');

const AppConstants = require('../app.constants');

module.exports = {
  async permission(req, res, next) {
    try {
      const user = req.user;
      const method = req.method;

      switch (method) {
        case 'POST':
        case 'PATCH':
        case 'DELETE':
          if (!user.isAdmin) {
            throw new Error('403');
          }
          break;
      }

      next();
    } catch (err) {
      next(err);
    }
  }
};
