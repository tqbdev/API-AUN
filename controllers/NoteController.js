const _ = require('lodash');
const logger = require('log4js').getLogger('error');

const { AUN_COMMENT } = require('../models');

module.exports = {
  async readAll(req, res) {
    try {
      const user = req.user;
      const { SubCriterionId } = req.query;
      if (!SubCriterionId) {
        return res.status(404).send({
          error: 'Require SubCriterionId param'
        });
      }

      const notes = await AUN_COMMENT.findAll({
        where: {
          SubCriterionId: SubCriterionId,
          UserEmail: user.email,
          isNote: true
        }
      });

      res.send(notes);
    } catch (err) {
      logger.error(err);
      res.status(500).send({
        error: 'Error in get notes'
      });
    }
  },

  async readOne(req, res) {
    try {
      const { id } = req.params;

      const note = await AUN_COMMENT.findByPk(id);

      if (!note) {
        return res.status(404).send({
          error: 'Not found the note has id ' + id
        });
      }

      res.send(note.toJSON());
    } catch (err) {
      logger.error(err);
      res.status(500).send({
        error: 'Error in get a note'
      });
    }
  },

  async create(req, res) {
    try {
      const user = req.user;
      const { title, SubCriterionId, content } = req.body;

      const note = await AUN_COMMENT.create({
        title,
        content,
        SubCriterionId,
        UserEmail: user.email,
        isNote: true
      });

      res.send(note.toJSON());
    } catch (err) {
      logger.error(err);
      res.status(500).send({
        error: 'Error in create a note'
      });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const { attributes } = req.body;

      const note = await AUN_COMMENT.findByPk(id);

      if (!note) {
        return res.status(404).send({
          error: 'Not found the note has id ' + id
        });
      }

      if (attributes.title === undefined && attributes.content === undefined) {
        return res.status(406).send({
          error: 'Not accepted. Required an attribute "title" or "content"'
        });
      }

      const title = attributes.title;
      const content = attributes.content;
      delete attributes.title;
      delete attributes.content;
      if (!_.isEmpty(attributes)) {
        return res.status(406).send({
          error: 'Not accepted. Only updatable for "title" and "content"'
        });
      }

      if (title) {
        await note.update({ title });
      }

      if (content) {
        await note.update({ content });
      }

      res.send(note.toJSON());
    } catch (err) {
      logger.error(err);
      res.status(500).send({
        error: 'Error in update a note'
      });
    }
  },

  async remove(req, res) {
    try {
      const { id } = req.params;

      const note = await AUN_COMMENT.findByPk(id);

      if (!note) {
        return res.status(404).send({
          error: 'Not found the note has id ' + id
        });
      }
      await note.destroy();

      res.send({});
    } catch (err) {
      logger.error(err);
      res.status(500).send({
        error: 'Error in delete a note'
      });
    }
  }
};
