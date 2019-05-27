const _ = require('lodash');

const {
  isNoteBelongToUser,
  isSubCriterionBelongToUser,
  isSARBelongToUser
} = require('../utils');

module.exports = {
  async permission(req, res, next) {
    try {
      let SARId = null;
      SARId = _.get(req, 'query.SARId') || null;
      await isSARBelongToUser(SARId, req);

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
