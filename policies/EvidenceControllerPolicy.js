const _ = require('lodash');

const { isSuggestionBelongToUser } = require('../utils');

module.exports = {
  async permission(req, res, next) {
    try {
      if (req.isAdmin) {
        return next();
      }
      const user = req.user;

      let SuggestionId = null;
      SuggestionId = _.get(req, 'query.SuggestionId') || null;
      await isSuggestionBelongToUser(SuggestionId, user);

      SuggestionId = _.get(req, 'body.SuggestionId') || null;
      await isSuggestionBelongToUser(SuggestionId, user);

      next();
    } catch (err) {
      res.status(403).send({
        error: 'You do not have access to this resource'
      });
    }
  }
};
