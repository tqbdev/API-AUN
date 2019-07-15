const _ = require('lodash');

const {
  isReversionBelongToUser,
  isCriterionBelongToUser
} = require('../utils');

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

      let ReversionId = null;
      ReversionId = _.get(req, 'query.ReversionId') || null;
      await isReversionBelongToUser(ReversionId, req);

      ReversionId = _.get(req, 'body.ReversionId') || null;
      await isReversionBelongToUser(ReversionId, req);

      let CriterionId = _.get(req, 'params.id') || null;
      await isCriterionBelongToUser(CriterionId, req);

      next();
    } catch (err) {
      next(err);
    }
  }
};
