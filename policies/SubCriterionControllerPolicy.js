const _ = require('lodash');
const AppConstants = require('../app.constants');

const {
  isCriterionBelongToUser,
  isSubCriterionBelongToUser
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

      let CriterionId = null;
      CriterionId = _.get(req, 'query.CriterionId') || null;
      await isCriterionBelongToUser(CriterionId, req);

      CriterionId = _.get(req, 'body.CriterionId') || null;
      await isCriterionBelongToUser(CriterionId, req);

      SubCriterionId = _.get(req, 'params.id') || null;
      await isSubCriterionBelongToUser(SubCriterionId, req);

      next();
    } catch (err) {
      next(err);
    }
  }
};
