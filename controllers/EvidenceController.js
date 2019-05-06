const _ = require('lodash');
const path = require('path');
const md5 = require('md5');
const logger = require('log4js').getLogger('error');

const { AUN_EVIDENCE, sequelize } = require('../models');
const AppConstant = require('../app.constants');

const { deleteFile, changeEvidence } = require('../utils');

module.exports = {
  async readAll(req, res) {
    try {
      const { SuggestionId, CriterionId, SARId } = req.query;
      if (!SuggestionId && !CriterionId) {
        return res.status(404).send({
          error: 'Require SuggestionId or CriterionId param'
        });
      }

      if (SuggestionId && CriterionId && SARId) {
        return res.status(406).send({
          error: 'Only one param: SuggestionId or CriterionId or SARId'
        });
      }

      if (SuggestionId) {
        const evidences = await AUN_EVIDENCE.findAll({
          where: { SuggestionId: SuggestionId }
        });

        res.send(evidences);
      } else if (CriterionId) {
        const evidences = await sequelize.query(
          'SELECT * FROM AUN_EVIDENCEs WHERE SuggestionId IN (SELECT id FROM AUN_SUGGESTIONs WHERE CriterionId = :CriterionId)',
          {
            replacements: { CriterionId: CriterionId },
            type: sequelize.QueryTypes.SELECT
          }
        );

        res.send(evidences);
      } else if (SARId) {
        const evidences = await sequelize.query(
          'SELECT * FROM AUN_EVIDENCEs WHERE SuggestionId IN (SELECT id FROM AUN_SUGGESTIONs WHERE CriterionId IN (SELECT id FROM AUN_CRITERIONs WHERE SARId = :SARId))',
          {
            replacements: { SARId: SARId },
            type: sequelize.QueryTypes.SELECT
          }
        );

        res.send(evidences);
      }
    } catch (err) {
      logger.error(err);
      res.status(500).send({
        error: 'Error in get evidences'
      });
    }
  },

  async readOne(req, res) {
    try {
      const { id } = req.params;

      const evidence = await AUN_EVIDENCE.findByPk(id);

      if (!evidence) {
        return res.status(404).send({
          error: 'Not found the evidence has id ' + id
        });
      }

      res.send(evidence.toJSON());
    } catch (err) {
      logger.error(err);
      res.status(500).send({
        error: 'Error in get a evidence'
      });
    }
  },

  async create(req, res) {
    try {
      const { type, SuggestionId, link, name } = req.body;

      let evidence = null;
      switch (type) {
        case AppConstant.ENUM.EVIDENCE_TYPE.LINK:
          {
            evidence = await AUN_EVIDENCE.create({
              name,
              type,
              link,
              SuggestionId,
              code: 'NOTHING'
            });
          }
          break;
        case AppConstant.ENUM.EVIDENCE_TYPE.FILE:
          {
            const file = _.get(req, 'files.file');

            if (!file) {
              return res.status(400).send({
                error: 'No files were uploaded.'
              });
            }

            const originName = _.get(file, 'name');
            const hashName =
              md5(originName + new Date().toDateString()) +
              path.extname(originName);
            const appPath = path.normalize(__dirname + '/..');
            const uploadPath = appPath + '/storage/' + hashName;
            const linkFile = '/storage/' + hashName;

            await file.mv(uploadPath);
            evidence = await AUN_EVIDENCE.create({
              name,
              type,
              link: linkFile,
              SuggestionId,
              code: 'NOTHING'
            });
          }
          break;
      }
      await evidence.update({
        code: `${req.SARId}.${req.CriterionId}.${evidence.id}`
      });
      return res.send(evidence.toJSON());
    } catch (err) {
      switch (err.name) {
        case 'SequelizeUniqueConstraintError':
          return res.status(400).send({
            error: `Can't create a new evidence. Because existing!!!`
          });
        default:
          logger.error(err);
          res.status(500).send({
            error: 'Error in create a evidence'
          });
      }
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const { attributes } = req.body;

      const evidence = await AUN_EVIDENCE.findByPk(id);

      if (!evidence) {
        return res.status(404).send({
          error: 'Not found the evidence has id ' + id
        });
      }

      if (attributes.name === undefined) {
        return res.status(406).send({
          error: 'Not accepted. Required an attribute "name"'
        });
      }

      const name = attributes.name;
      delete attributes.name;
      if (!_.isEmpty(attributes)) {
        return res.status(406).send({
          error: 'Not accepted. Only updatable for "name"'
        });
      }

      if (name) {
        await evidence.update({ name });

        const subCriterions = await evidence.getSubCriterions();
        if (subCriterions) {
          await Promise.all(
            _.forEach(subCriterions, async subCriterion => {
              const content = await changeEvidence(subCriterion, evidence);
              await subCriterion.update({
                content: content
              });
            })
          );
        }
      }

      res.send(evidence.toJSON());
    } catch (err) {
      switch (err.name) {
        case 'SequelizeUniqueConstraintError':
          return res.status(400).send({
            error: `Can't update a evidence. Because existing!!!`
          });
        default:
          logger.error(err);
          res.status(500).send({
            error: 'Error in update a evidence'
          });
      }
    }
  },

  async remove(req, res) {
    try {
      const { id } = req.params;

      const evidence = await AUN_EVIDENCE.findByPk(id);

      if (!evidence) {
        return res.status(404).send({
          error: 'Not found the evidence has id ' + id
        });
      }

      const evidences = await AUN_EVIDENCE.findAll({
        where: {
          link: evidence.link
        }
      });

      if (evidences) {
        await Promise.all(
          _.forEach(evidences, async evidence => {
            const type = evidence.type;
            const link = evidence.link;

            const subCriterions = await evidence.getSubCriterions();
            if (subCriterions) {
              await Promise.all(
                _.forEach(subCriterions, async subCriterion => {
                  const content = await changeEvidence(
                    subCriterion,
                    evidence,
                    true
                  );
                  await subCriterion.update({
                    content: content
                  });
                })
              );
            }

            if (type === AppConstant.ENUM.EVIDENCE_TYPE.FILE) {
              const appPath = path.normalize(__dirname + '/..');
              const uploadedPath = appPath + link;
              await deleteFile(uploadedPath);
            }

            await evidence.destroy();
          })
        );
      }

      res.send({});
    } catch (err) {
      logger.error(err);
      res.status(500).send({
        error: 'Error in delete a evidence'
      });
    }
  }
};
