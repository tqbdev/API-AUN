const _ = require('lodash');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
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

    const SAR = await AUN_SAR.findByPk(id);

    req.SARId = id;

    if (!assignment && !(SAR.isTemplate && req.isAdmin)) throw new Error();
  }
};

const isCriterionBelongToUser = async (id, user, req) => {
  if (id) {
    const criterion = await AUN_CRITERION.findByPk(id);

    if (criterion) {
      req.CriterionId = criterion.id;
      await isSARBelongToUser(criterion.SARId, user, req);
    }
  }
};

const isSubCriterionBelongToUser = async (id, user, req) => {
  if (id) {
    const subCriterion = await AUN_SUB_CRITERION.findByPk(id);

    if (subCriterion) {
      req.SubCriterionId = subCriterion.id;
      await isCriterionBelongToUser(subCriterion.CriterionId, user, req);
    }
  }
};

const isSuggestionBelongToUser = async (id, user, req) => {
  if (id) {
    const suggestion = await AUN_SUGGESTION.findByPk(id);

    if (suggestion) {
      req.SuggestionId = suggestion.id;
      await isCriterionBelongToUser(suggestion.CriterionId, user, req);
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
      req.CommentId = comment.id;
      await isSubCriterionBelongToUser(comment.SubCriterionId, user, req);
    }
  }
};

const isNoteBelongToUser = async (id, user, req) => {
  if (id && user) {
    const note = await AUN_COMMENT.findOne({
      where: {
        UserEmail: user.email,
        id: id
      }
    });

    if (note) {
      req.NoteId = note.id;
      await isSubCriterionBelongToUser(note.SubCriterionId, user, req);
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
      req.EvidenceId = evidence.id;
      await isSuggestionBelongToUser(evidence.SuggestionId, user, req);
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

  await Promise.all(
    _.forEach(criterions, async criterionRaw => {
      const criterion = criterionRaw.toJSON();
      await cloneChildCriterion(criterion, newSAR.id);
    })
  );

  return newSAR.id;
};

const findEvidence = async (subCriterion, findTotal) => {
  const content = subCriterion.content;
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
      ).exec(match)[5];
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
      ).exec(match)[2];
      if (keywords === '') return null;
      return keywords;
    });
    linkKeys = _.filter(linkKeys, key => {
      return key !== null && key !== '';
    });
  }

  let evidences = null;
  let evidenceKeys = [];
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
        },
        CriterionId: subCriterion.CriterionId
      }
    });

    evidences = evidences.map(evidence => evidence.toJSON());
  }

  if (findTotal) {
    _.forEach(evidences, evidence => {
      const link = evidence.link;
      const regexPattern = new RegExp(
        `(<a[\\w\\d\\s]*href=["'].*${link}["']{1}.*)(data-value=["']{1}.*["']{1})(.*>)(.*)(<\/a>)`,
        'gu'
      );
      console.log(content);
      const total = countRef(content, regexPattern);
      evidence.total = total;
    });
  }

  console.log(evidences);

  return evidences;
};

const countRef = (str, pattern) => {
  return ((str || '').match(pattern) || []).length;
};

const deleteFile = async path => {
  return await fs.unlinkSync(path);
};

module.exports = {
  isSARBelongToUser,
  isCriterionBelongToUser,
  isSubCriterionBelongToUser,
  isSuggestionBelongToUser,
  isCommentBelongToUser,
  isNoteBelongToUser,
  isEvidenceBelongToUser,
  cloneSAR,
  findEvidence,
  deleteFile
};
