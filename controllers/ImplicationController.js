const _ = require('lodash');

const { AUN_IMPLICATION } = require('../models');

module.exports = {
  async readAll(req, res) {
    try {
      const { SubCriterionId } = req.query;
      if (!SubCriterionId) {
        return res.status(404).send({
          error: 'Require SubCriterionId param'
        });
      }

      const implications = await AUN_IMPLICATION.findAll({
        where: { SubCriterionId: SubCriterionId }
      });

      if (!implications) {
        return res.status(404).send({
          error:
            'Not found any implications belong to the criteria has id ' +
            SubCriterionId
        });
      }

      res.send(implications);
    } catch (err) {
      res.status(500).send({
        error: 'Error in get implications'
      });
    }
  },

  async readOne(req, res) {
    try {
      const { id } = req.params;

      const implication = await AUN_IMPLICATION.findByPk(id);

      if (!implication) {
        return res.status(404).send({
          error: 'Not found the implication has id ' + id
        });
      }

      res.send(implication.toJSON());
    } catch (err) {
      res.status(500).send({
        error: 'Error in get a implication'
      });
    }
  },

  async create(req, res) {
    try {
      const { content, SubCriterionId } = req.body;

      const implication = await AUN_IMPLICATION.create({
        content,
        SubCriterionId: SubCriterionId
      });

      res.send(implication.toJSON());
    } catch (err) {
      res.status(500).send({
        error: 'Error in create a implication'
      });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const { attributes } = req.body;

      const implication = await AUN_IMPLICATION.findByPk(id);

      if (!implication) {
        return res.status(404).send({
          error: 'Not found criteria has id ' + id
        });
      }

      if (attributes.content === undefined) {
        return res.status(406).send({
          error: 'Not accepted. Required an attribute "content"'
        });
      }

      const content = attributes.content;
      delete attributes.content;
      if (!_.isEmpty(attributes)) {
        return res.status(406).send({
          error: 'Not accepted. We accepted only an attribute "content"'
        });
      }

      await implication.update({ content });

      res.send(implication.toJSON());
    } catch (err) {
      res.status(500).send({
        error: 'Error in update a implication'
      });
    }
  },

  async remove(req, res) {
    try {
      const { id } = req.params;

      const implication = await AUN_IMPLICATION.findByPk(id);

      if (!implication) {
        return res.status(404).send({
          error: 'Not found the implication has id ' + id
        });
      }
      await implication.destroy();

      res.send({});
    } catch (err) {
      res.status(500).send({
        error: 'Error in delete a implication'
      });
    }
  }
};
