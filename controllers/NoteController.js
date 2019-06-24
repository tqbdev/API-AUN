const _ = require('lodash');
const logger = require('log4js').getLogger('error');

const { AUN_COMMENT, AUN_SUB_CRITERION, AUN_CRITERION } = require('../models');

module.exports = {
  async readAll(req, res) {
    try {
      const user = req.user;
      const { SubCriterionId, ReversionId } = req.query;
      if (!SubCriterionId && !ReversionId) {
        return res.status(405).send({
          error: 'Require SubCriterionId or ReversionId param'
        });
      }

      if (SubCriterionId && ReversionId) {
        return res.status(405).send({
          error: 'Allow only one param'
        });
      }

      // const notes = await AUN_COMMENT.findAll({
      //   where: {
      //     SubCriterionId: SubCriterionId,
      //     UserEmail: user.email,
      //     isNote: true
      //   }
      // });

      if (SubCriterionId) {
        const subCriterion = await AUN_SUB_CRITERION.findByPk(SubCriterionId);

        if (!subCriterion) {
          return res.status(404).send({
            error: 'Not found SubCriterion'
          });
        }

        const notes = await subCriterion.getComments({
          where: {
            isNote: true,
            UserEmail: user.email
          }
        });

        return res.send(notes);
      }

      if (ReversionId) {
        const noteTree = [];

        const criterionIds = await AUN_CRITERION.findAll({
          where: {
            ReversionId: ReversionId
          },
          attributes: ['id']
        }).map(criterionId => {
          return _.get(criterionId.toJSON(), 'id');
        });

        for (let i = 0, iMax = +_.get(criterionIds, 'length'); i < iMax; i++) {
          const criterionId = criterionIds[i];
          const res = [];

          const subCriterions = await AUN_SUB_CRITERION.findAll({
            where: {
              CriterionId: criterionId
            }
          });

          for (
            let j = 0, jMax = +_.get(subCriterions, 'length');
            j < jMax;
            j++
          ) {
            const subCriterion = subCriterions[j];
            const notes = await subCriterion
              .getComments({
                where: {
                  isNote: true,
                  UserEmail: user.email
                }
              })
              .map(note => {
                return note.toJSON();
              });

            if (_.isEmpty(notes)) {
              res.push([]);
            } else {
              res.push(notes);
            }
          }

          noteTree.push(res);
        }

        return res.send(noteTree);
      }
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
      const user = req.user;

      const note = await AUN_COMMENT.findOne({
        where: {
          id: id,
          isNote: true,
          UserEmail: user.email
        }
      });

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
        // SubCriterionId,
        UserEmail: user.email,
        isNote: true
      });

      note.addSubCriterions([SubCriterionId]);

      // const note = await AUN_COMMENT.create({
      //   title,
      //   content,
      //   SubCriterionId,
      //   UserEmail: user.email,
      //   isNote: true
      // });

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
      const user = req.user;

      // const note = await AUN_COMMENT.findByPk(id);
      const note = await AUN_COMMENT.findOne({
        where: {
          id: id,
          isNote: true,
          UserEmail: user.email
        }
      });

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
      const user = req.user;

      // const note = await AUN_COMMENT.findByPk(id);
      const note = await AUN_COMMENT.findOne({
        where: {
          id: id,
          isNote: true,
          UserEmail: user.email
        }
      });

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
