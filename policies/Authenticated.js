const AppConstants = require('../app.constants');

const passport = require('passport');

module.exports = {
  isAuthenticated(req, res, next) {
    passport.authenticate('jwt', function(err, user) {
      if (err || !user) {
        res.status(403).send({
          error: 'You do not have access to this resource'
        });
      } else {
        req.user = user;
        next();
      }
    })(req, res, next);
  },
  // Create, Update and Delete
  canCUD(req, res, next) {
    const user = req.user;

    switch (user.role) {
      case AppConstants.ENUM.ROLE.ADMIN:
      case AppConstants.ENUM.ROLE.EDITOR:
        req.isAdmin = user.role === AppConstants.ENUM.ROLE.ADMIN;
        next();
        break;
      default:
        res.status(403).send({
          error: 'You do not have access to this resource'
        });
    }
  }
};
