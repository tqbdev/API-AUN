const _ = require('lodash');
const Op = require('sequelize').Op;

const AppContanst = require('../app.constants');

const {
  AUN_SAR,
  AUN_CRITERION,
  AUN_SUB_CRITERION,
  AUN_ASSIGNMENT,
  AUN_SUGGESTION,
  AUN_COMMENT,
  AUN_EVIDENCE
} = require('../models');

const isSARBelongToUser = async (id, user, req) => {
  if (id) {
    const assignment = await AUN_ASSIGNMENT.findOne({
      where: {
        UserEmail: user.email,
        SARId: id
      }
    });

    if (!assignment) throw new Error();
  }
};

const isCriterionBelongToUser = async (id, user, req) => {
  if (id) {
    const criterion = await AUN_CRITERION.findByPk(id);

    if (criterion) {
      await isSARBelongToUser(criterion.SARId, user);
    }
  }
};

const isSubCriterionBelongToUser = async (id, user, req) => {
  if (id) {
    const subCriterion = await AUN_SUB_CRITERION.findByPk(id);

    if (subCriterion) {
      await isCriterionBelongToUser(subCriterion.CriterionId, user);
    }
  }
};

const isSuggestionBelongToUser = async (id, user, req) => {
  if (id) {
    const suggestion = await AUN_SUGGESTION.findByPk(id);

    if (suggestion) {
      await isCriterionBelongToUser(suggestion.CriterionId, user);
    }
  }
};

const isCommentBelongToUser = async (id, user, req) => {
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
};

const isEvidenceBelongToUser = async (id, user, req) => {
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
};

const cloneChildCriterion = async (criterion, newSARId) => {
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

const cloneSAR = async oldSARId => {
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
};

const findEvidence = async content => {
  let fileKeys = content.match(
    new RegExp(
      AppContanst.PATTERN.EVIDENCE.source,
      AppContanst.PATTERN.EVIDENCE.flags
    )
  );
  if (fileKeys) {
    fileKeys = fileKeys.map(match => {
      const keywords = new RegExp(
        AppContanst.PATTERN.EVIDENCE.source,
        AppContanst.PATTERN.EVIDENCE.flags
      ).exec(match)[4];
      if (keywords === '') return null;
      return { [Op.like]: '%' + keywords };
    });
    fileKeys = _.filter(fileKeys, key => {
      return key !== null && key !== '';
    });
  }

  let linkKeys = content.match(
    new RegExp(
      AppContanst.PATTERN.EVIDENCE.source,
      AppContanst.PATTERN.EVIDENCE.flags
    )
  );
  if (linkKeys) {
    linkKeys = linkKeys.map(match => {
      const keywords = new RegExp(
        AppContanst.PATTERN.EVIDENCE.source,
        AppContanst.PATTERN.EVIDENCE.flags
      ).exec(match)[1];
      if (keywords === '') return null;
      return keywords;
    });
    linkKeys = _.filter(linkKeys, key => {
      return key !== null && key !== '';
    });
  }

  let evidences = null;
  let evidenceKeys = [];
  // const evidenceKeys = [...fileKeys, ...linkKeys];
  if (fileKeys) {
    evidenceKeys.push(...fileKeys);
  }

  if (linkKeys) {
    evidenceKeys.push(...linkKeys);
  }
  if (evidenceKeys.length) {
    evidences = await AUN_EVIDENCE.findAll({
      where: {
        link: {
          [Op.or]: evidenceKeys
        }
      }
    });
  }

  return evidences;
};

module.exports = {
  isSARBelongToUser,
  isCriterionBelongToUser,
  isSubCriterionBelongToUser,
  isSuggestionBelongToUser,
  isCommentBelongToUser,
  isEvidenceBelongToUser,
  cloneSAR,
  findEvidence
};
