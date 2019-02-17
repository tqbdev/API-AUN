const _ = require('lodash');

const { AUN_QUESTION } = require('../models');

module.exports = {
  async readAll(req, res) {
    try {
      const { SubCriterionId } = req.query;
      if (!SubCriterionId) {
        return res.status(404).send({
          error: 'Require SubCriterionId param'
        });
      }

      const diaquestions = await AUN_QUESTION.findAll({
        where: {
          SubCriterionId: SubCriterionId
        }
      });

      res.send(diaquestions);
    } catch (err) {
      res.status(500).send({
        error: 'Error in get diaquestions'
      });
    }
  },

  async readOne(req, res) {
    try {
      const { id } = req.params;

      const diaquestion = await AUN_QUESTION.findByPk(id);

      if (!diaquestion) {
        return res.status(404).send({
          error: 'Not found the diaquestion has id ' + id
        });
      }

      res.send(diaquestion.toJSON());
    } catch (err) {
      res.status(500).send({
        error: 'Error in get a diaquestion'
      });
    }
  },

  async create(req, res) {
    try {
      let { question, answer, SubCriterionId } = req.body;

      const diaquestion = await AUN_QUESTION.create({
        question,
        answer,
        SubCriterionId: SubCriterionId
      });

      res.send(diaquestion.toJSON());
    } catch (err) {
      res.status(500).send({
        error: 'Error in create a diaquestion'
      });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const { attributes } = req.body;

      const diaquestion = await AUN_QUESTION.findByPk(id);

      if (!diaquestion) {
        return res.status(404).send({
          error: 'Not found the diaquestion has id ' + id
        });
      }

      if (
        attributes.question === undefined &&
        attributes.answer === undefined
      ) {
        return res.status(406).send({
          error: 'Not accepted. Required an attribute "question" or "answer"'
        });
      }

      const question = attributes.question;
      const answer = attributes.answer;
      delete attributes.question;
      delete attributes.answer;
      if (!_.isEmpty(attributes)) {
        return res.status(406).send({
          error: 'Not accepted. Only updatable for "question" and "answer"'
        });
      }

      if (question) {
        await diaquestion.update({ question });
      }

      if (answer) {
        await diaquestion.update({ answer });
      }

      res.send(diaquestion.toJSON());
    } catch (err) {
      res.status(500).send({
        error: 'Error in update a diaquestion'
      });
    }
  },

  async remove(req, res) {
    try {
      const { id } = req.params;

      const diaquestion = await AUN_QUESTION.findByPk(id);

      if (!diaquestion) {
        return res.status(404).send({
          error: 'Not found the diaquestion has id ' + id
        });
      }
      await diaquestion.destroy();

      res.send({});
    } catch (err) {
      res.status(500).send({
        error: 'Error in delete a diaquestion'
      });
    }
  }
};
