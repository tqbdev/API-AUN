const _ = require('lodash');

const {
  isCriterionBelongToUser,
  isSuggestionBelongToUser
} = require('../utils');

module.exports = {
  async permission(req, res, next) {
    try {
      if (req.isAdmin) {
        return next();
      }
      const user = req.user;

      let CriterionId = null;
      CriterionId = _.get(req, 'query.CriterionId') || null;
      await isCriterionBelongToUser(CriterionId, user);

      CriterionId = _.get(req, 'body.CriterionId') || null;
      await isCriterionBelongToUser(CriterionId, user);

      SuggestionId = _.get(req, 'params.id') || null;
      await isSuggestionBelongToUser(SuggestionId, user);
    } catch (err) {
      res.status(403).send({
        error: 'You do not have access to this resource'
      });
    }
  }
};
