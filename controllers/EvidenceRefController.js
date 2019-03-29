const logger = require('log4js').getLogger('error');

const { AUN_EVIDENCE_REF, AUN_SUB_CRITERION } = require('../models');

module.exports = {
  async readAll(req, res) {
    try {
      const { EvidenceId } = req.query;
      if (!EvidenceId) {
        return res.status(404).send({
          error: 'Require EvidenceId param'
        });
      }

      const evidenceRefs = await AUN_EVIDENCE_REF.findAll({
        where: { EvidenceId: EvidenceId },
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
