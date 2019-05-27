const _ = require('lodash');
const AppConstants = require('../app.constants');

const {
  isSuggestionBelongToUser,
  isCriterionBelongToUser,
  isEvidenceBelongToUser
} = require('../utils');

module.exports = {
  async permission(req, res, next) {
    try {
      req.isRequiredEditor = false;

      switch (req.method) {
        case 'POST':
        case 'PATCH':
        case 'DELETE':
          req.role = AppConstants.ENUM.ROLE.EDITOR;
          break;
      }

      let SuggestionId = null;
      SuggestionId = _.get(req, 'query.SuggestionId') || null;
      await isSuggestionBelongToUser(SuggestionId, req);

      SuggestionId = _.get(req, 'body.SuggestionId') || null;
      await isSuggestionBelongToUser(SuggestionId, req);

      let CriterionId = null;
      CriterionId = _.get(req, 'query.CriterionId') || null;
      await isCriterionBelongToUser(CriterionId, req);

      CriterionId = _.get(req, 'body.CriterionId') || null;
      await isCriterionBelongToUser(CriterionId, req);

      EvidenceId = _.get(req, 'params.id') || null;
      await isEvidenceBelongToUser(EvidenceId, req);

      next();
    } catch (err) {
      next(err);
    }
  }
};
