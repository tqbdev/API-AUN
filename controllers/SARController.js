const _ = require('lodash');
const Op = require('sequelize').Op;
const logger = require('log4js').getLogger('error');

const { AUN_SAR, AUN_ASSIGNMENT } = require('../models');

renameKey = (obj, oldKey, newKey) => {
  if (_.has(obj, oldKey)) {
    obj[newKey] = _.clone(obj[oldKey]);
    delete obj[oldKey];
  }

  return obj;
};

module.exports = {
  async readAll(req, res) {
    try {
      const user = req.user;

      if (req.isAdmin) {
        let sars = [];

        sars = await AUN_SAR.findAll({});

        sars = _.chain(sars)
          .groupBy('isTemplate')
          .toJSON();

        sars = renameKey(sars, 'true', 'templates');
        sars = renameKey(sars, 'false', 'projects');

        res.send(sars);
      } else {
        const sars = await AUN_ASSIGNMENT.findAll({
          where: {
            UserEmail: user.email
          },
          include: [
            {
              model: AUN_SAR,
              as: 'SARs'
            }
          ]
        });
        res.send(sars);
      }
    } catch (err) {
      logger.error(err);
      res.status(500).send({
        error: 'Error in get SARs.'
      });
    }
  },

  async readOne(req, res) {
    try {
      const { id } = req.params;
      const user = req.user;

      if (!req.isAdmin) {
        const assignment = await AUN_ASSIGNMENT.findOne({
          where: {
            UserEmail: user.email,
            SARId: id
          }
        });

        if (!assignment) {
          return res.status(403).send({
            error: 'You do not have access to this resource'
          });
        }
      }

      const sar = await AUN_SAR.findByPk(id);

      if (!sar) {
        return res.status(404).send({
          error: 'Not found the SAR has id ' + id
        });
      }

      res.send(sar.toJSON());
    } catch (err) {
      logger.error(err);
      res.status(500).send({
        error: 'Error in get a SAR'
      });
    }
  },

  async create(req, res) {
    try {
      const { name } = req.body;
      const sar = await AUN_SAR.create({ name });

      res.send(sar.toJSON());
    } catch (err) {
      switch (err.name) {
        case 'SequelizeUniqueConstraintError':
          return res.status(400).send({
            error: `Can't create a new SAR. Because existing!!!`
          });
        default:
          logger.error(err);
          res.status(500).send({
            error: 'Error in create a SAR'
          });
      }
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const { attributes } = req.body;

      const sar = await AUN_SAR.findByPk(id);

      if (!sar) {
        return res.status(404).send({
          error: 'Not found the SAR has id ' + id
        });
      }

      if (attributes.name === undefined) {
        return res.status(406).send({
          error: 'Not accepted. Required an attribute "name"'
        });
      }

      const name = attributes.name;
      delete attributes.name;
      if (!_.isEmpty(attributes)) {
        return res.status(406).send({
          error: 'Not accepted. We accepted only an attribute "name"'
        });
      }

      await sar.update({ name });

      res.send(sar.toJSON());
    } catch (err) {
      switch (err.name) {
        case 'SequelizeUniqueConstraintError':
          return res.status(400).send({
            error: `Can't update a SAR. Because existing!!!`
          });
        default:
          logger.error(err);
          res.status(500).send({
            error: 'Error in update a SAR'
          });
      }
    }
  },

  async remove(req, res) {
    try {
      const { id } = req.params;

      const sar = await AUN_SAR.findByPk(id);

      if (!sar) {
        return res.status(404).send({
          error: 'Not found the SAR has id ' + id
        });
      }
      await sar.destroy();

      res.send({});
    } catch (err) {
      logger.error(err);
      res.status(500).send({
        error: 'Error in delete a Sar'
      });
    }
  }
};
