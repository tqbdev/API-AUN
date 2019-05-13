const _ = require('lodash');
const logger = require('log4js').getLogger('error');

const { AUN_SUB_CRITERION, AUN_EVIDENCE_REF, sequelize } = require('../models');

const { findEvidence } = require('../utils');

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
      logger.error(err);
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
      logger.error(err);
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

      const evidences = await findEvidence(subCriterion, true);
      if (evidences) {
        for (let i = 0; i < evidences.length; i++) {
          const evidence = evidences[i];
          await AUN_EVIDENCE_REF.create({
            SubCriterionId: subCriterion.id,
            EvidenceId: evidence.id,
            total: evidence.total
          });
        }
      }

      res.send(subCriterion.toJSON());
    } catch (err) {
      switch (err.name) {
        case 'SequelizeUniqueConstraintError':
          return res.status(400).send({
            error: `Can't create a new SubCriterion. Because existing!!!`
          });
        default:
          logger.error(err);
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
        await sequelize.query(
          'DELETE FROM AUN_EVIDENCE_REFs WHERE SubCriterionId = :SubCriterionId',
          {
            replacements: { SubCriterionId: subCriterion.id },
            type: sequelize.QueryTypes.DELETE
          }
        );
        const evidences = await findEvidence(subCriterion, true);
        if (evidences) {
          for (let i = 0; i < evidences.length; i++) {
            const evidence = evidences[i];
            await AUN_EVIDENCE_REF.create({
              SubCriterionId: subCriterion.id,
              EvidenceId: evidence.id,
              total: evidence.total
            });
          }
        }
      }

      res.send(subCriterion.toJSON());
    } catch (err) {
      switch (err.name) {
        case 'SequelizeUniqueConstraintError':
          return res.status(400).send({
            error: `Can't update a SubCriterion. Because existing!!!`
          });
        default:
          logger.error(err);
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
      logger.error(err);
      res.status(500).send({
        error: 'Error in delete a SubCriterion'
      });
    }
  }
};
