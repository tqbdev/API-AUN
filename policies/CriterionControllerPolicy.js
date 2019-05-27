const _ = require('lodash');

const { isSARBelongToUser, isCriterionBelongToUser } = require('../utils');

module.exports = {
  async permission(req, res, next) {
    try {
      const user = req.user;
      switch (req.method) {
        case 'POST':
        case 'PATCH':
        case 'DELETE':
          if (!user.isAdmin) {
            throw new Error('403');
          }
          break;
      }

      let SARId = null;
      SARId = _.get(req, 'query.SARId') || null;
      await isSARBelongToUser(SARId, req);

      SARId = _.get(req, 'body.SARId') || null;
      await isSARBelongToUser(SARId, req);

      CriterionId = _.get(req, 'params.id') || null;
      await isCriterionBelongToUser(CriterionId, req);

      next();
    } catch (err) {
      next(err);
    }
  }
};
