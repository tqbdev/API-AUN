const _ = require('lodash');
const logger = require('log4js').getLogger('error');

const AppConstant = require('../app.constants');

const { AUN_COMMENT, AUN_SUB_CRITERION } = require('../models');

module.exports = {
  async readAll(req, res) {
    try {
      const { SubCriterionId, role } = req.query;
      if (!SubCriterionId) {
        return res.status(404).send({
          error: 'Require SubCriterionId param'
        });
      }

      const subCriterion = await AUN_SUB_CRITERION.findByPk(SubCriterionId);

      if (!subCriterion) {
        return res.status(404).send({
          error: 'Not found SubCriterion'
        });
      }

      const queryCondition = {
        where: {
          isNote: false
        }
      };

      if (role === AppConstant.ENUM.ROLE.REVIEWER) {
        queryCondition.where.isEditor = false;
      }

      const comments = await subCriterion.getComments(queryCondition);

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
      const { role } = req.query;

      const queryCondition = {
        where: {
          id: id,
          isNote: false
        }
      };

      if (role === AppConstant.ENUM.ROLE.REVIEWER) {
        queryCondition.where.isEditor = false;
      }

      const comment = await AUN_COMMENT.findOne(queryCondition);

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
      const { title, SubCriterionId, content, isEditor } = req.body;

      const comment = await AUN_COMMENT.create({
        title,
        content,
        isEditor: (isEditor && !req.isRelease) || true,
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
      const user = req.user;

      const comment = await AUN_COMMENT.findOne({
        where: {
          id: id,
          isNote: false,
          UserEmail: user.email
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
      const user = req.user;

      const comment = await AUN_COMMENT.findOne({
        where: {
          id: id,
          isNote: false,
          UserEmail: user.email
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
