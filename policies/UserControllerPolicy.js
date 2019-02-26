const _ = require('lodash');

const AppConstants = require('../app.constants');

module.exports = {
  async permission(req, res, next) {
    const user = req.user;

    switch (user.role) {
      case AppConstants.ENUM.ROLE.ADMIN:
        next();
        break;
      default:
        res.status(403).send({
          error: 'You do not have access to this resource'
        });
    }
  }
};
