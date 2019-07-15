const _ = require('lodash');

const AppConstants = require('../app.constants');

module.exports = {
  async permission(req, res, next) {
    try {
      const user = req.user;

      if (user.isAdmin) {
        next();
      } else {
        throw new Error('403');
      }
    } catch (err) {
      next(err);
    }
  }
};
