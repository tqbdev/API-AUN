const _ = require('lodash');

const {
  AUN_SAR,
  AUN_CRITERION,
  AUN_SUB_CRITERION,
  AUN_ASSIGNMENT,
  AUN_SUGGESTION,
  AUN_COMMENT,
  AUN_EVIDENCE
} = require('../models');

module.exports = {
  async isSARBelongToUser(id, user) {
    if (id) {
      const assignment = await AUN_ASSIGNMENT.findOne({
        where: {
          UserEmail: user.email,
          id
        }
      });

      if (!assignment) throw new Error();
    }
  },

  async isCriterionBelongToUser(id, user) {
    if (id) {
      const criterion = await AUN_CRITERION.findByPk(id);

      if (criterion) {
        await isSARBelongToUser(criterion.id, user);
      }
    }
  },

  async isSubCriterionBelongToUser(id, user) {
    if (id) {
      const subCriterion = await AUN_SUB_CRITERION.findByPk(id);

      if (subCriterion) {
        await isCriterionBelongToUser(subCriterion.id, user);
      }
    }
  },

  async isSuggestionBelongToUser(id, user) {
    if (id) {
      const suggestion = await AUN_SUGGESTION.findByPk(id);

      if (suggestion) {
        await isCriterionBelongToUser(suggestion.id, user);
      }
    }
  },

  async isCommentBelongToUser(id, user) {
    if (id && user) {
      const comment = await AUN_COMMENT.findOne({
        where: {
          UserEmail: user.email,
          id: id
        }
      });

      if (comment) {
        await isSubCriterionBelongToUser(comment.SubCriterionId, user);
      }
    }
  },

  async isEvidenceBelongToUser(id, user) {
    if (id && user) {
      const evidence = await AUN_EVIDENCE.findOne({
        where: {
          id: id
        }
      });

      if (evidence) {
        await isSuggestionBelongToUser(evidence.SuggestionId, user);
      }
    }
  },

  // Request oldSARId and return newSARId
  async cloneSAR(oldSARId) {
    let oldSAR = await AUN_SAR.findByPk(oldSARId);

    oldSAR = oldSAR.toJSON();

    let criterions = await AUN_CRITERION.findAll({
      where: {
        SARId: oldSAR.id
      }
    });

    delete oldSAR.id;
    oldSAR.isTemplate = false;

    const newSAR = await AUN_SAR.create(oldSAR);

    await _.forEach(criterions, async criterionRaw => {
      const criterion = criterionRaw.toJSON();
      await cloneChildCriterion(criterion, newSAR.id);
    });

    return newSAR.id;
  }
};

cloneChildCriterion = async (criterion, newSARId) => {
  let oldCriterion = _.cloneDeep(criterion);
  delete oldCriterion.id;
  oldCriterion.SARId = newSARId;
  const newCriterion = await AUN_CRITERION.create(oldCriterion);

  let subCriterions = await AUN_SUB_CRITERION.findAll({
    where: {
      CriterionId: criterion.id
    }
  });

  subCriterions = _.map(subCriterions, subCriterion => {
    let value = subCriterion.toJSON();
    delete value.id;
    value.CriterionId = newCriterion.id;
    return value;
  });

  await AUN_SUB_CRITERION.bulkCreate(subCriterions);

  let suggestions = await AUN_SUGGESTION.findAll({
    where: {
      CriterionId: criterion.id
    }
  });

  suggestions = _.map(suggestions, suggestion => {
    let value = suggestion.toJSON();
    delete value.id;
    value.CriterionId = newCriterion.id;
    return value;
  });

  await AUN_SUGGESTION.bulkCreate(suggestions);
};
