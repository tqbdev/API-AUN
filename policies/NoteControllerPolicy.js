const _ = require('lodash');

const {
  isNoteBelongToUser,
  isSubCriterionBelongToUser,
  isReversionBelongToUser
} = require('../utils');

module.exports = {
  async permission(req, res, next) {
    try {
      let ReversionId = null;
      ReversionId = _.get(req, 'query.ReversionId') || null;
      await isReversionBelongToUser(ReversionId, req);

      let SubCriterionId = null;
      SubCriterionId = _.get(req, 'query.SubCriterionId') || null;
      await isSubCriterionBelongToUser(SubCriterionId, req);

      SubCriterionId = _.get(req, 'body.SubCriterionId') || null;
      await isSubCriterionBelongToUser(SubCriterionId, req);

      let NoteId = _.get(req, 'params.id') || null;
      await isNoteBelongToUser(NoteId, req);

      next();
    } catch (err) {
      next(err);
    }
  }
};
