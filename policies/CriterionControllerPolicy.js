const _ = require('lodash');

const { isSARBelongToUser, isCriterionBelongToUser } = require('../utils');

module.exports = {
  async permission(req, res, next) {
    try {
      if (req.isAdmin) {
        return next();
      }
      const user = req.user;

      let SARId = null;
      SARId = _.get(req, 'query.SARId') || null;
      await isSARBelongToUser(SARId, user, req);

      SARId = _.get(req, 'body.SARId') || null;
      await isSARBelongToUser(SARId, user, req);

      CriterionId = _.get(req, 'params.id') || null;
      await isCriterionBelongToUser(CriterionId, user, req);

      next();
    } catch (err) {
      res.status(403).send({
        error: 'You do not have access to this resource'
      });
    }
  }
};
