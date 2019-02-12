const _ = require('lodash');

const { AUNCriterion } = require('../models');

module.exports = {
  async readAll(req, res) {
    try {
      const { SARId } = req.query;
      if (!SARId) {
        return res.status(404).send({
          error: 'Require SARId param'
        });
      }

      const criterions = await AUNCriterion.findAll({
        where: { AUNSarId: SARId }
      });

      if (!criterions) {
        return res.status(404).send({
          error: 'Not found any criterions belong to the SAR has id ' + SARId
        });
      }

      res.send(criterions);
    } catch (err) {
      res.status(500).send({
        error: 'Error in get criterions'
      });
    }
  },

  async readOne(req, res) {
    try {
      const { id } = req.params;

      const criterion = await AUNCriterion.findByPk(id);

      if (!criterion) {
        return res.status(404).send({
          error: 'Not found the criterion has id ' + id
        });
      }

      res.send(criterion.toJSON());
    } catch (err) {
      res.status(500).send({
        error: 'Error in get a criterion'
      });
    }
  },

  async create(req, res) {
    try {
      const { name, SARId, description } = req.body;

      const newCriterion = await AUNCriterion.create({
        name,
        description,
        AUNSarId: SARId
      });

      res.send(newCriterion.toJSON());
    } catch (err) {
      switch (err.name) {
        case 'SequelizeUniqueConstraintError':
          return res.status(500).send({
            error: `Can't create a new Criterion. Because existing!!!`
          });
        default:
          res.status(500).send({
            error: 'Error in create a Criterion'
          });
      }
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const { attributes } = req.body;

      const criterion = await AUNCriterion.findByPk(id);

      if (!criterion) {
        return res.status(404).send({
          error: 'Not found the criterion has id ' + id
        });
      }

      if (
        attributes.name === undefined &&
        attributes.description === undefined
      ) {
        return res.status(406).send({
          error: 'Not accepted. Required an attribute "name" or "description"'
        });
      }

      const name = attributes.name;
      const description = attributes.description;
      delete attributes.name;
      delete attributes.description;
      if (!_.isEmpty(attributes)) {
        return res.status(406).send({
          error: 'Not accepted. Only updatable for "name" and "description"'
        });
      }

      if (name) {
        await criterion.update({ name });
      }

      if (description) {
        await criterion.update({ description });
      }

      res.send(criterion.toJSON());
    } catch (err) {
      switch (err.name) {
        case 'SequelizeUniqueConstraintError':
          return res.status(500).send({
            error: `Can't update a criterion. Because existing!!!`
          });
        default:
          res.status(500).send({
            error: 'Error in update a criterion'
          });
      }
    }
  },

  async remove(req, res) {
    try {
      const { id } = req.params;

      const criterion = await AUNCriterion.findByPk(id);

      if (!criterion) {
        return res.status(404).send({
          error: 'Not found the criterion has id ' + id
        });
      }
      await criterion.destroy();

      res.send({});
    } catch (err) {
      res.status(500).send({
        error: 'Error in delete a criterion'
      });
    }
  }
};
