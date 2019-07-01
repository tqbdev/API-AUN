const _ = require('lodash');
const logger = require('log4js').getLogger('error');

const { AUN_REVERSION, AUN_SAR } = require('../models');

const { cloneReversion, extractReversionToPdf } = require('../utils');

const AppConstants = require('../app.constants');

module.exports = {
  async readAll(req, res) {
    try {
      const { SARId, role } = req.query;
      if (!SARId) {
        return res.status(400).send({
          error: 'Require SARId param'
        });
      }

      if (!_.includes(req.roles, role)) {
        return res.status(403).send({
          error: 'You do not have access to this resource'
        });
      }

      const queryCondition = {
        where: {
          SARId: SARId
        }
      };

      if (role === AppConstants.ENUM.ROLE.REVIEWER) {
        queryCondition.where.isRelease = true;
      }

      const reversions = (await AUN_REVERSION.findAll(queryCondition)).map(
        reversion => {
          return reversion.toJSON();
        }
      );

      if (role === AppConstants.ENUM.ROLE.REVIEWER) {
        const highestVersion = _.maxBy(reversions, reversion => {
          return reversion.version;
        });

        if (highestVersion) {
          return res.send([highestVersion]);
        }

        return res.send([]);
      }

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
      const { ReversionId } = req.body;

      if (ReversionId) {
        let sar = null;
        const reversionDB = await AUN_REVERSION.findByPk(ReversionId);
        if (!reversionDB) {
          return res.status(404).send({
            error: 'Not found the reversion has id ' + ReversionId
          });
        } else {
          sar = await reversionDB.getSAR();
        }

        if (sar && sar.isTemplate) {
          return res.status(400).send({
            error: 'Cannot create reversion for template'
          });
        }

        const reversion = await cloneReversion(ReversionId);
        return res.send(reversion);
      }

      return res.status(400).send({});
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
      const { SARId } = req.body;

      const sar = await AUN_SAR.findByPk(SARId);

      if (sar && sar.isTemplate) {
        return res.status(400).send({
          error: 'Cannot release reversion for template'
        });
      }

      const curReversion = await AUN_REVERSION.findOne({
        where: {
          SARId: SARId
        },
        order: [['version', 'DESC']]
      });

      if (!curReversion) {
        return res.status(404).send({
          error: 'Not found any reversion'
        });
      }

      await curReversion.update({
        isRelease: true
      });

      // const reversion = await cloneReversion(ReversionId, true);
      const reversion = await AUN_REVERSION.findByPk(curReversion.id);

      await cloneReversion(curReversion.id);

      res.send(reversion);
    } catch (err) {
      switch (err.name) {
        case 'SequelizeUniqueConstraintError':
          return res.status(400).send({
            error: `Can't release a new reversion. Because existing!!!`
          });
        default:
          logger.error(err);
          res.status(500).send({
            error: 'Error in release a reversion'
          });
      }
    }
  },

  async extract(req, res) {
    try {
      const { ReversionId } = req.body;

      if (ReversionId) {
        const reversion = await AUN_REVERSION.findByPk(ReversionId);
        if (!reversion) {
          return res.status(404).send({
            error: 'Not found the reversion has id ' + ReversionId
          });
        }

        const linkFile = await extractReversionToPdf(reversion.id);

        return res.send({
          link: linkFile
        });
      }

      return res.status(400).send({});
    } catch (err) {
      logger.error(err);
      res.status(500).send({
        error: 'Error in extract a reversion'
      });
    }
  }
};
