const _ = require('lodash');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const Op = require('sequelize').Op;

const xPathSelect = require('xpath.js');
const DOMParser = require('xmldom').DOMParser;
const XMLSerializer = require('xmldom').XMLSerializer;

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

const findEvidence = async (subCriterion, findTotal = false) => {
  const content = subCriterion.content;

  let contentDoc = new DOMParser().parseFromString(content);
  const aTags = xPathSelect(contentDoc, '//a[@data-value and @href]');

  let keys = [];
  _.forEach(aTags, aTag => {
    const href = aTag.getAttribute('href');
    if (href) keys.push(href);
  });

  let countKeys = [...keys];

  let fileKeys = [];
  _.forEach(keys, key => {
    const file = _.get(
      new RegExp(
        AppContanst.PATTERN.LINK.source,
        AppContanst.PATTERN.LINK.flags
      ).exec(key),
      '[4]'
    );
    if (file) {
      countKeys.push(file);
      fileKeys.push(file);
    }
  });

  keys = _.uniq(keys);
  fileKeys = _.uniq(fileKeys);

  _.map(fileKeys, fileKey => {
    return { [Op.like]: '%' + fileKey };
  });

  keys.push(...fileKeys);
  let evidences = null;
  if (keys.length) {
    evidences = await AUN_EVIDENCE.findAll({
      where: {
        link: {
          [Op.or]: keys
        }
        // CriterionId: subCriterion.CriterionId
        // TODO: Limit CriterionId
      }
    });

    evidences = evidences.map(evidence => evidence.toJSON());
  }

  if (findTotal) {
    countKeys = _.countBy(countKeys);
    _.forEach(evidences, evidence => {
      const link = evidence.link;
      const total = _.get(countKeys, link);
      evidence.total = total;
    });
  }

  return evidences;
};

const changeEvidence = async (subCriterion, evidence, isDelete = false) => {
  const content = subCriterion.content;

  const newValue = isDelete ? 'Unknown' : evidence.name;

  let contentDoc = new DOMParser().parseFromString(content);
  const aTags = xPathSelect(contentDoc, '//a[@data-value and @href]');

  _.forEach(aTags, aTag => {
    const href = aTag.getAttribute('href');
    const file = _.get(
      new RegExp(
        AppContanst.PATTERN.LINK.source,
        AppContanst.PATTERN.LINK.flags
      ).exec(href),
      '[4]'
    );

    if (href === evidence.link || file === evidence.link) {
      if (isDelete) aTag.setAttribute('href', '');
      aTag.setAttribute('data-value', newValue);
      let last = aTag;
      while (last.hasChildNodes()) {
        last = last.firstChild;
      }
      last.data = '@' + newValue;
    }
  });

  return new XMLSerializer().serializeToString(contentDoc);
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
  changeEvidence,
  deleteFile
};
