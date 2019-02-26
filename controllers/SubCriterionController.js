const _ = require('lodash');

const { AUN_SUB_CRITERION } = require('../models');

module.exports = {
  async readAll(req, res) {
    try {
      const { CriterionId } = req.query;
      if (!CriterionId) {
        return res.status(404).send({
          error: 'Require CriterionId param'
        });
      }

      const SubCriterions = await AUN_SUB_CRITERION.findAll({
        where: { CriterionId: CriterionId }
      });

      res.send(SubCriterions);
    } catch (err) {
      res.status(500).send({
        error: 'Error in get SubCriterions'
      });
    }
  },

  async readOne(req, res) {
    try {
      const { id } = req.params;

      const subCriterion = await AUN_SUB_CRITERION.findByPk(id);

      if (!subCriterion) {
        return res.status(404).send({
          error: 'Not found the SubCriterion has id ' + id
        });
      }

      res.send(subCriterion.toJSON());
    } catch (err) {
      res.status(500).send({
        error: 'Error in get a SubCriterion'
      });
    }
  },

  async create(req, res) {
    try {
      let { name, CriterionId, content } = req.body;

      const subCriterion = await AUN_SUB_CRITERION.create({
        name,
        content,
        CriterionId
      });

      res.send(subCriterion.toJSON());
    } catch (err) {
      switch (err.name) {
        case 'SequelizeUniqueConstraintError':
          return res.status(400).send({
            error: `Can't create a new SubCriterion. Because existing!!!`
          });
        default:
          res.status(500).send({
            error: 'Error in create a SubCriterion'
          });
      }
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const { attributes } = req.body;

      const subCriterion = await AUN_SUB_CRITERION.findByPk(id);

      if (!subCriterion) {
        return res.status(404).send({
          error: 'Not found the SubCriterion has id ' + id
        });
      }

      if (attributes.name === undefined && attributes.content === undefined) {
        return res.status(406).send({
          error: 'Not accepted. Required an attribute "name" or "content"'
        });
      }

      const name = attributes.name;
      const content = attributes.content;
      delete attributes.name;
      delete attributes.content;
      if (!_.isEmpty(attributes)) {
        return res.status(406).send({
          error: 'Not accepted. Only updatable for "name" and "content"'
        });
      }

      if (name) {
        await subCriterion.update({ name });
      }

      if (content) {
        await subCriterion.update({ content });
      }

      res.send(subCriterion.toJSON());
    } catch (err) {
      switch (err.name) {
        case 'SequelizeUniqueConstraintError':
          return res.status(400).send({
            error: `Can't update a SubCriterion. Because existing!!!`
          });
        default:
          res.status(500).send({
            error: 'Error in update a SubCriterion'
          });
      }
    }
  },

  async remove(req, res) {
    try {
      const { id } = req.params;

      const subCriterion = await AUN_SUB_CRITERION.findByPk(id);

      if (!subCriterion) {
        return res.status(404).send({
          error: 'Not found the SubCriterion has id ' + id
        });
      }
      await subCriterion.destroy();

      res.send({});
    } catch (err) {
      res.status(500).send({
        error: 'Error in delete a SubCriterion'
      });
    }
  }
};
