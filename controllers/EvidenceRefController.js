const logger = require('log4js').getLogger('error');
const _ = require('lodash');
const Op = require('sequelize').Op;

const AppConstant = require('../app.constants');

const {
  AUN_EVIDENCE_REF,
  AUN_SUB_CRITERION,
  AUN_EVIDENCE
} = require('../models');

module.exports = {
  async readAll(req, res) {
    try {
      const { EvidenceId } = req.query;
      if (!EvidenceId) {
        return res.status(404).send({
          error: 'Require EvidenceId param'
        });
      }

      const evidence = await AUN_EVIDENCE.findByPk(EvidenceId);

      if (!evidence) {
        return res.status(404).send({
          error: 'Not found any evidence has id ' + EvidenceId
        });
      }

      const evidenceIds = await AUN_EVIDENCE.findAll({
        where: {
          link: evidence.link,
          type: AppConstant.ENUM.EVIDENCE_TYPE.FILE
        },
        attributes: ['id']
      }).map(item => {
        return item.toJSON().id;
      });

      let where = {
        EvidenceId: null
      };

      if (_.isEmpty(evidenceIds)) {
        where.EvidenceId = EvidenceId;
      } else {
        where.EvidenceId = {
          [Op.or]: evidenceIds
        };
      }

      const evidenceRefs = await AUN_EVIDENCE_REF.findAll({
        where: where,
        include: [
          {
            model: AUN_SUB_CRITERION,
            as: 'SubCriterion',
            attributes: ['id', 'name', 'CriterionId', 'createdAt', 'updatedAt']
          }
        ]
      });

      res.send(evidenceRefs);
    } catch (err) {
      logger.error(err);
      res.status(500).send({
        error: 'Error in get evidenceRefs'
      });
    }
  }
};
