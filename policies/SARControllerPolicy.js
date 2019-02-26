const _ = require('lodash');

const AppConstants = require('../app.constants');

module.exports = {
  async permission(req, res, next) {
    try {
      const user = req.user;
      const method = req.method;

      switch (method) {
        case 'GET':
          break;
        case 'POST':
        case 'PATCH':
        case 'DELETE':
          if (user.role != AppConstants.ENUM.ROLE.ADMIN) {
            throw new Error();
          }
          break;
      }

      next();
    } catch (err) {
      res.status(403).send({
        error: 'You do not have access to this resource'
      });
    }
  }
};
