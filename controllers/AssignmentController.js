const _ = require('lodash');

const { AUN_SAR, AUN_ASSIGNMENT } = require('../models');

const { cloneSAR } = require('../utils');

module.exports = {
  async readAll(req, res) {
    try {
      const assignments = await AUN_ASSIGNMENT.findAll({});
      res.send(assignments);
    } catch (err) {
      res.status(500).send({
        error: 'Error in get assignments.'
      });
    }
  },

  async readOne(req, res) {
    try {
      const { id } = req.params;

      const assignment = await AUN_ASSIGNMENT.findByPk(id);

      if (!assignment) {
        return res.status(404).send({
          error: 'Not found the assignment has id ' + id
        });
      }

      res.send(assignment.toJSON());
    } catch (err) {
      res.status(500).send({
        error: 'Error in get a assignment'
      });
    }
  },

  async create(req, res) {
    try {
      const { SARId, UserEmail } = req.body;

      const sar = await AUN_SAR.findByPk(SARId);

      if (sar.isTemplate) {
        const newSARId = await cloneSAR(sar.id);
        const assignment = await AUN_ASSIGNMENT.create({
          SARId: newSARId,
          UserEmail
        });

        res.send(assignment.toJSON());
      } else {
        const assignment = await AUN_ASSIGNMENT.create({
          SARId,
          UserEmail
        });

        res.send(assignment.toJSON());
      }
    } catch (err) {
      switch (err.name) {
        case 'SequelizeUniqueConstraintError':
          return res.status(400).send({
            error: `Can't create a new assignment. Because existing!!!`
          });
        default:
          res.status(500).send({
            error: 'Error in create a assignment'
          });
      }
    }
  },

  async remove(req, res) {
    try {
      const { id } = req.params;

      const assignment = await AUN_ASSIGNMENT.findByPk(id);

      if (!assignment) {
        return res.status(404).send({
          error: 'Not found the assignment has id ' + id
        });
      }
      await assignment.destroy();

      res.send({});
    } catch (err) {
      res.status(500).send({
        error: 'Error in delete a assignment'
      });
    }
  }
};
