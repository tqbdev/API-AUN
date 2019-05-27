const _ = require('lodash');

const {
  isCriterionBelongToUser,
  isSuggestionBelongToUser
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

      let CriterionId = null;
      CriterionId = _.get(req, 'query.CriterionId') || null;
      await isCriterionBelongToUser(CriterionId, req);

      CriterionId = _.get(req, 'body.CriterionId') || null;
      await isCriterionBelongToUser(CriterionId, req);

      SuggestionId = _.get(req, 'params.id') || null;
      await isSuggestionBelongToUser(SuggestionId, req);

      next();
    } catch (err) {
      next(err);
    }
  }
};
