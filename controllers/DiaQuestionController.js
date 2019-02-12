const _ = require('lodash');

const { AUNDiaQuestion } = require('../models');

module.exports = {
  async readAll(req, res) {
    try {
      const { CriteriaId } = req.query;
      if (!CriteriaId) {
        return res.status(404).send({
          error: 'Require CriteriaId param'
        });
      }

      const diaquestions = await AUNDiaQuestion.findAll({ id: CriteriaId });

      if (!diaquestions) {
        return res.status(404).send({
          error:
            'Not found any diaquestions belong to the criteria has id ' +
            CriteriaId
        });
      }

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

      const diaquestion = await AUNDiaQuestion.findByPk(id);

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
      let { question, answer, CriteriaId } = req.body;

      const diaquestion = await AUNDiaQuestion.create({
        question,
        answer,
        AUNCriteriumId: CriteriaId
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

      const diaquestion = await AUNDiaQuestion.findByPk(id);

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

      const diaquestion = await AUNDiaQuestion.findByPk(id);

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
