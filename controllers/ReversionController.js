const _ = require('lodash');
const logger = require('log4js').getLogger('error');

const { AUN_REVERSION } = require('../models');

const { cloneReversion } = require('../utils');

const AppConstants = require('../app.constants');

module.exports = {
  async readAll(req, res) {
    try {
      const { SARId } = req.query;
      if (!SARId) {
        return res.status(400).send({
          error: 'Require SARId param'
        });
      }

      const reversions = await AUN_REVERSION.findAll({
        where: {
          SARId: SARId,
          isRelease: req.role === AppConstants.ENUM.ROLE.REVIEWER
        }
      });

      res.send(reversions);
    } catch (err) {
      logger.error(err);
      res.status(500).send({
        error: 'Error in get reversions'
      });
    }
  },

  async readOne(req, res) {
    try {
      const { id } = req.params;

      const reversion = await AUN_REVERSION.findByPk(id);

      if (!reversion) {
        return res.status(404).send({
          error: 'Not found the reversion has id ' + id
        });
      }

      res.send(reversion.toJSON());
    } catch (err) {
      logger.error(err);
      res.status(500).send({
        error: 'Error in get a reversion'
      });
    }
  },

  async create(req, res) {
    try {
      const { ReversionId, SARId } = req.body;

      if (ReversionId) {
        const reversion = await cloneReversion(ReversionId);
        res.send(reversion);
      }

      if (SARId) {
        const reversion = AUN_REVERSION.create({
          SARId: SARId
        });
        res.send(reversion);
      }

      res.status(400).send({});
    } catch (err) {
      switch (err.name) {
        case 'SequelizeUniqueConstraintError':
          return res.status(400).send({
            error: `Can't create a new reversion. Because existing!!!`
          });
        default:
          logger.error(err);
          res.status(500).send({
            error: 'Error in create a reversion'
          });
      }
    }
  },

  async release(req, res) {
    try {
      const { ReversionId } = req.body;

      const reversion = await cloneReversion(ReversionId, true);
      res.send(reversion);
    } catch (err) {
      switch (err.name) {
        case 'SequelizeUniqueConstraintError':
          return res.status(400).send({
            error: `Can't create a new reversion. Because existing!!!`
          });
        default:
          logger.error(err);
          res.status(500).send({
            error: 'Error in create a reversion'
          });
      }
    }
  }
};
