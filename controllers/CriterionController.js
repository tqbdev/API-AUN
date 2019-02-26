const _ = require('lodash');

const { AUN_CRITERION } = require('../models');

module.exports = {
  async readAll(req, res) {
    try {
      const { SARId } = req.query;
      if (!SARId) {
        return res.status(404).send({
          error: 'Require SARId param'
        });
      }

      const criterions = await AUN_CRITERION.findAll({
        where: { SARId: SARId }
      });

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

      const criterion = await AUN_CRITERION.findByPk(id);

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

      const newCriterion = await AUN_CRITERION.create({
        name,
        description,
        SARId: SARId
      });

      res.send(newCriterion.toJSON());
    } catch (err) {
      switch (err.name) {
        case 'SequelizeUniqueConstraintError':
          return res.status(400).send({
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

      const criterion = await AUN_CRITERION.findByPk(id);

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
          return res.status(400).send({
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

      const criterion = await AUN_CRITERION.findByPk(id);

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
