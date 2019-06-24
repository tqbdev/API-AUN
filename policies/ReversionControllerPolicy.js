const _ = require('lodash');

const AppConstants = require('../app.constants');

const { isReversionBelongToUser, isSARBelongToUser } = require('../utils');

module.exports = {
  async permission(req, res, next) {
    try {
      switch (req.method) {
        case 'POST':
        case 'PATCH':
        case 'DELETE':
          req.role = AppConstants.ENUM.ROLE.EDITOR;
          req.point = 'REVERSION';
          break;
      }

      let SARId = null;
      let ReversionId = null;
      SARId = _.get(req, 'query.SARId') || null;
      await isSARBelongToUser(SARId, req);

      SARId = _.get(req, 'body.SARId') || null;
      await isSARBelongToUser(SARId, req);

      ReversionId = _.get(req, 'params.id') || null;
      await isReversionBelongToUser(ReversionId, req);

      next();
    } catch (err) {
      next(err);
    }
  }
};
