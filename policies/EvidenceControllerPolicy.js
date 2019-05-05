const _ = require('lodash');

const {
  isSuggestionBelongToUser,
  isCriterionBelongToUser,
  isEvidenceBelongToUser
} = require('../utils');

module.exports = {
  async permission(req, res, next) {
    try {
      // if (req.isAdmin) {
      //   return next();
      // }
      const user = req.user;

      let SuggestionId = null;
      SuggestionId = _.get(req, 'query.SuggestionId') || null;
      await isSuggestionBelongToUser(SuggestionId, user, req);

      SuggestionId = _.get(req, 'body.SuggestionId') || null;
      await isSuggestionBelongToUser(SuggestionId, user, req);

      let CriterionId = null;
      CriterionId = _.get(req, 'query.CriterionId') || null;
      await isCriterionBelongToUser(CriterionId, user, req);

      CriterionId = _.get(req, 'body.CriterionId') || null;
      await isCriterionBelongToUser(CriterionId, user, req);

      EvidenceId = _.get(req, 'params.id') || null;
      await isEvidenceBelongToUser(EvidenceId, user, req);

      next();
    } catch (err) {
      res.status(403).send({
        error: 'You do not have access to this resource'
      });
    }
  }
};
