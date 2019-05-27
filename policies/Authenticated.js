const AppConstants = require('../app.constants');

const passport = require('passport');

module.exports = {
  isAuthenticated(req, res, next) {
    passport.authenticate('jwt', function(err, user) {
      if (err || !user) {
        try {
          throw new Error('401');
        } catch (err) {
          next(err);
        }
      } else {
        req.user = user.toJSON();
        next();
      }
    })(req, res, next);
  },
  adminRole(req, res, next) {
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
  },
  editorRole(req, res, next) {
    const method = req.method;

    switch (method) {
      case 'POST':
      case 'PATCH':
      case 'DELETE':
        req.isRequiredEditor = true;
        break;
    }

    next();
  }
};
