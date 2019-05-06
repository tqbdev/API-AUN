const _ = require('lodash');
const logger = require('log4js').getLogger('error');

const { AUN_COMMENT, AUN_SUB_CRITERION } = require('../models');

module.exports = {
  async readAll(req, res) {
    try {
      const { SubCriterionId } = req.query;
      if (!SubCriterionId) {
        return res.status(404).send({
          error: 'Require SubCriterionId param'
        });
      }

      // const comments = await AUN_COMMENT.findAll({
      //   where: {
      //     SubCriterionId: SubCriterionId,
      //     isNote: false
      //   }
      // });

      const subCriterion = await AUN_SUB_CRITERION.findByPk(SubCriterionId);

      if (!subCriterion) {
        return res.status(404).send({
          error: 'Not found SubCriterion'
        });
      }

      const comments = await subCriterion.getComments({
        where: {
          isNote: false
        }
      });

      res.send(comments);
    } catch (err) {
      logger.error(err);
      res.status(500).send({
        error: 'Error in get comments'
      });
    }
  },

  async readOne(req, res) {
    try {
      const { id } = req.params;

      const comment = await AUN_COMMENT.findOne({
        where: {
          id: id,
          isNote: false
        }
      });

      if (!comment) {
        return res.status(404).send({
          error: 'Not found the comment has id ' + id
        });
      }

      res.send(comment.toJSON());
    } catch (err) {
      logger.error(err);
      res.status(500).send({
        error: 'Error in get a comment'
      });
    }
  },

  async create(req, res) {
    try {
      const user = req.user;
      const { title, SubCriterionId, content } = req.body;

      const comment = await AUN_COMMENT.create({
        title,
        content,
        // SubCriterionId,
        UserEmail: user.email
      });

      comment.addSubCriterions([SubCriterionId]);

      res.send(comment.toJSON());
    } catch (err) {
      logger.error(err);
      res.status(500).send({
        error: 'Error in create a comment'
      });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const { attributes } = req.body;

      const comment = await AUN_COMMENT.findOne({
        where: {
          id: id,
          isNote: false
        }
      });

      if (!comment) {
        return res.status(404).send({
          error: 'Not found the comment has id ' + id
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
        await comment.update({ title });
      }

      if (content) {
        await comment.update({ content });
      }

      res.send(comment.toJSON());
    } catch (err) {
      logger.error(err);
      res.status(500).send({
        error: 'Error in update a comment'
      });
    }
  },

  async remove(req, res) {
    try {
      const { id } = req.params;

      const comment = await AUN_COMMENT.findOne({
        where: {
          id: id,
          isNote: false
        }
      });

      if (!comment) {
        return res.status(404).send({
          error: 'Not found the comment has id ' + id
        });
      }
      await comment.destroy();

      res.send({});
    } catch (err) {
      logger.error(err);
      res.status(500).send({
        error: 'Error in delete a comment'
      });
    }
  }
};
