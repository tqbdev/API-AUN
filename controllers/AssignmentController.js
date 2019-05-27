const _ = require('lodash');
const logger = require('log4js').getLogger('error');

const { AUN_SAR, AUN_ASSIGNMENT } = require('../models');

const { cloneSAR } = require('../utils');

module.exports = {
  async readAll(req, res) {
    try {
      const assignments = await AUN_ASSIGNMENT.findAll({
        include: [
          {
            model: AUN_SAR,
            as: 'SARs'
          }
        ]
      });
      res.send(assignments);
    } catch (err) {
      logger.error(err);
      res.status(500).send({
        error: 'Error in get assignments.'
      });
    }
  },

  async readOne(req, res) {
    try {
      const { id } = req.params;

      const assignment = await AUN_ASSIGNMENT.findByPk(id, {
        include: [
          {
            model: AUN_SAR,
            as: 'SARs'
          }
        ]
      });

      if (!assignment) {
        return res.status(404).send({
          error: 'Not found the assignment has id ' + id
        });
      }

      res.send(assignment.toJSON());
    } catch (err) {
      logger.error(err);
      res.status(500).send({
        error: 'Error in get a assignment'
      });
    }
  },

  async create(req, res) {
    try {
      const { SARId, UserEmail, role } = req.body;

      const sar = await AUN_SAR.findByPk(SARId);

      if (!sar) {
        return res.status(404).send({
          error: 'Not found the sar has id ' + SARId
        });
      }

      if (sar.isTemplate) {
        const newSARId = await cloneSAR(sar.id);
        const [assignment, created] = await AUN_ASSIGNMENT.findOrCreate({
          where: {
            UserEmail: UserEmail,
            role: role
          },
          defaults: {
            UserEmail: UserEmail,
            role: role
          }
        });

        await assignment.addSARs([newSARId]);
        const resData = await AUN_ASSIGNMENT.findByPk(assignment.id, {
          include: [
            {
              model: AUN_SAR,
              as: 'SARs'
            }
          ]
        });
        res.send(resData);
      } else {
        const [assignment, created] = await AUN_ASSIGNMENT.findOrCreate({
          where: {
            UserEmail: UserEmail,
            role: role
          },
          defaults: {
            UserEmail: UserEmail,
            role: role
          }
        });

        await assignment.addSARs([SARId]);
        const resData = await AUN_ASSIGNMENT.findByPk(assignment.id, {
          include: [
            {
              model: AUN_SAR,
              as: 'SARs'
            }
          ]
        });
        res.send(resData);
      }
    } catch (err) {
      switch (err.name) {
        case 'SequelizeUniqueConstraintError':
          return res.status(400).send({
            error: `Can't create a new assignment. Because existing!!!`
          });
        default:
          logger.error(err);
          res.status(500).send({
            error: 'Error in create a assignment'
          });
      }
    }
  },

  async remove(req, res) {
    try {
      const { id } = req.params;
      const { SARId } = req.body;

      const assignment = await AUN_ASSIGNMENT.findByPk(id);

      if (!assignment) {
        return res.status(404).send({
          error: 'Not found the assignment has id ' + id
        });
      }

      if (SARId) {
        await assignment.removeSARs([SARId]);
        const resData = await AUN_ASSIGNMENT.findByPk(assignment.id, {
          include: [
            {
              model: AUN_SAR,
              as: 'SARs'
            }
          ]
        });

        if (_.isEmpty(_.get(resData, 'SARs'))) {
          await assignment.destroy();
          res.send({});
        } else {
          res.send(resData);
        }
      } else {
        await assignment.destroy();
        res.send({});
      }
    } catch (err) {
      logger.error(err);
      res.status(500).send({
        error: 'Error in delete a assignment'
      });
    }
  }
};
