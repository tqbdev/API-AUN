const _ = require('lodash');

const { AUN_SUGGESTION } = require('../models');

module.exports = {
  async readAll(req, res) {
    try {
      const { CriterionId } = req.query;
      if (!CriterionId) {
        return res.status(404).send({
          error: 'Require CriterionId param'
        });
      }

      const sugesstions = await AUN_SUGGESTION.findAll({
        where: { CriterionId: CriterionId }
      });

      res.send(sugesstions);
    } catch (err) {
      res.status(500).send({
        error: 'Error in get sugesstions'
      });
    }
  },

  async readOne(req, res) {
    try {
      const { id } = req.params;

      const sugesstion = await AUN_SUGGESTION.findByPk(id);

      if (!sugesstion) {
        return res.status(404).send({
          error: 'Not found the suggestion has id ' + id
        });
      }

      res.send(sugesstion.toJSON());
    } catch (err) {
      res.status(500).send({
        error: 'Error in get a suggestion'
      });
    }
  },

  async create(req, res) {
    try {
      let { type, CriterionId, content } = req.body;

      const sugesstion = await AUN_SUGGESTION.create({
        type,
        content,
        CriterionId
      });

      res.send(sugesstion.toJSON());
    } catch (err) {
      switch (err.name) {
        case 'SequelizeUniqueConstraintError':
          return res.status(400).send({
            error: `Can't create a new suggestion. Because existing!!!`
          });
        default:
          res.status(500).send({
            error: 'Error in create a suggestion'
          });
      }
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const { attributes } = req.body;

      const sugesstion = await AUN_SUGGESTION.findByPk(id);

      if (!sugesstion) {
        return res.status(404).send({
          error: 'Not found the suggestion has id ' + id
        });
      }

      if (
        attributes.type === undefined &&
        attributes.content === undefined &&
        attributes.status === undefined
      ) {
        return res.status(406).send({
          error:
            'Not accepted. Required an attribute "type" or "content" or "status"'
        });
      }

      const type = attributes.type;
      const content = attributes.content;
      delete attributes.type;
      delete attributes.content;
      if (!_.isEmpty(attributes)) {
        return res.status(406).send({
          error:
            'Not accepted. Only updatable for "type", "content" and "status"'
        });
      }

      if (type) {
        await sugesstion.update({ type });
      }

      if (content) {
        await sugesstion.update({ content });
      }

      res.send(sugesstion.toJSON());
    } catch (err) {
      switch (err.name) {
        case 'SequelizeUniqueConstraintError':
          return res.status(400).send({
            error: `Can't update a suggestion. Because existing!!!`
          });
        default:
          res.status(500).send({
            error: 'Error in update a suggestion'
          });
      }
    }
  },

  async remove(req, res) {
    try {
      const { id } = req.params;

      const sugesstion = await AUN_SUGGESTION.findByPk(id);

      if (!sugesstion) {
        return res.status(404).send({
          error: 'Not found the suggestion has id ' + id
        });
      }
      await sugesstion.destroy();

      res.send({});
    } catch (err) {
      res.status(500).send({
        error: 'Error in delete a suggestion'
      });
    }
  }
};
