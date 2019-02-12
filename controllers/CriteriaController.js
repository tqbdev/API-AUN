const _ = require('lodash');

const { AUNCriteria } = require('../models');

module.exports = {
  async readAll(req, res) {
    try {
      const { CriterionId } = req.query;
      if (!CriterionId) {
        return res.status(404).send({
          error: 'Require CriterionId param'
        });
      }

      const criterias = await AUNCriteria.findAll({ id: CriterionId });

      if (!criterias) {
        return res.status(404).send({
          error:
            'Not found any criterias belong to the criterion has id ' +
            CriterionId
        });
      }

      res.send(criterias);
    } catch (err) {
      res.status(500).send({
        error: 'Error in get criterias'
      });
    }
  },

  async readOne(req, res) {
    try {
      const { id } = req.params;

      const criteria = await AUNCriteria.findByPk(id);

      if (!criteria) {
        return res.status(404).send({
          error: 'Not found the criteria has id ' + id
        });
      }

      res.send(criteria.toJSON());
    } catch (err) {
      res.status(500).send({
        error: 'Error in get a criteria'
      });
    }
  },

  async create(req, res) {
    try {
      let { name, CriterionId, description } = req.body;

      const newCriteria = await AUNCriteria.create({
        name,
        description,
        AUNCriterionId: CriterionId
      });

      res.send(newCriteria.toJSON());
    } catch (err) {
      switch (err.name) {
        case 'SequelizeUniqueConstraintError':
          return res.status(500).send({
            error: `Can't create a new criteria. Because existing!!!`
          });
        default:
          res.status(500).send({
            error: 'Error in create a criteria'
          });
      }
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const { attributes } = req.body;

      const criteria = await AUN.findByPk(id);

      if (!criteria) {
        return res.status(404).send({
          error: 'Not found the criteria has id ' + id
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

      res.send(criteria.toJSON());
    } catch (err) {
      switch (err.name) {
        case 'SequelizeUniqueConstraintError':
          return res.status(500).send({
            error: `Can't update a criteria. Because existing!!!`
          });
        default:
          res.status(500).send({
            error: 'Error in update a criteria'
          });
      }
    }
  },

  async remove(req, res) {
    try {
      const { id } = req.params;

      const criteria = await AUNCriteria.findByPk(id);

      if (!criteria) {
        return res.status(404).send({
          error: 'Not found the criteria has id ' + id
        });
      }
      await criteria.destroy();

      res.send({});
    } catch (err) {
      res.status(500).send({
        error: 'Error in delete a criteria'
      });
    }
  }
};
