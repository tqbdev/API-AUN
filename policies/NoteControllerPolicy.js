const _ = require('lodash');

const { isNoteBelongToUser, isSubCriterionBelongToUser } = require('../utils');

module.exports = {
  async permission(req, res, next) {
    try {
      // if (req.isAdmin) {
      //   return next();
      // }
      const user = req.user;

      let SubCriterionId = null;
      SubCriterionId = _.get(req, 'query.SubCriterionId') || null;
      await isSubCriterionBelongToUser(SubCriterionId, user, req);

      SubCriterionId = _.get(req, 'body.SubCriterionId') || null;
      await isSubCriterionBelongToUser(SubCriterionId, user, req);

      NoteId = _.get(req, 'params.id') || null;
      await isNoteBelongToUser(NoteId, user, req);

      next();
    } catch (err) {
      res.status(403).send({
        error: 'You do not have access to this resource'
      });
    }
  }
};