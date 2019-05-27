const _ = require('lodash');

const {
  isCommentBelongToUser,
  isSubCriterionBelongToUser
} = require('../utils');

module.exports = {
  async permission(req, res, next) {
    try {
      let SubCriterionId = null;
      SubCriterionId = _.get(req, 'query.SubCriterionId') || null;
      await isSubCriterionBelongToUser(SubCriterionId, req);

      SubCriterionId = _.get(req, 'body.SubCriterionId') || null;
      await isSubCriterionBelongToUser(SubCriterionId, req);

      CommentId = _.get(req, 'params.id') || null;
      await isCommentBelongToUser(CommentId, req);

      next();
    } catch (err) {
      next(err);
    }
  }
};
