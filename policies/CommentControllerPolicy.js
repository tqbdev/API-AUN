const _ = require('lodash');

const {
  isCommentBelongToUser,
  isSubCriterionBelongToUser
} = require('../utils');

module.exports = {
  async permission(req, res, next) {
    try {
      if (req.isAdmin) {
        return next();
      }
      const user = req.user;

      let SubCriterionId = null;
      SubCriterionId = _.get(req, 'query.SubCriterionId') || null;
      await isSubCriterionBelongToUser(SubCriterionId, user);

      SubCriterionId = _.get(req, 'body.SubCriterionId') || null;
      await isSubCriterionBelongToUser(SubCriterionId, user);

      CommentId = _.get(req, 'params.id') || null;
      await isCommentBelongToUser(CommentId, user);
    } catch (err) {
      res.status(403).send({
        error: 'You do not have access to this resource'
      });
    }
  }
};
