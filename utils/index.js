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

const isSARBelongToUser = async (id, req) => {
  if (id) {
    const user = req.user;
    const assignment = await AUN_ASSIGNMENT.findOne({
      where: {
        UserEmail: user.email
      },
      include: [
        {
          model: AUN_SAR,
          as: 'SARs',
          where: {
            id: id
          }
        }
      ]
    });

    const SAR = await AUN_SAR.findByPk(id);

    if (!SAR) {
      throw new Error('404');
    }

    if (SAR.isTemplate) {
      if (!user.isAdmin) {
        throw new Error('403');
      }
    } else {
      if (!assignment) {
        throw new Error('403');
      } else {
        if (
          req.role === AppContanst.ENUM.ROLE.EDITOR &&
          assignment.role !== req.role
        ) {
          throw new Error('403');
        }
      }
    }

    req.SARId = id;
  }
};

const isCriterionBelongToUser = async (id, req) => {
  if (id) {
    const criterion = await AUN_CRITERION.findByPk(id);

    if (criterion) {
      req.CriterionId = criterion.id;
      await isSARBelongToUser(criterion.SARId, req);
    }
  }
};

const isSubCriterionBelongToUser = async (id, req) => {
  if (id) {
    const subCriterion = await AUN_SUB_CRITERION.findByPk(id);

    if (subCriterion) {
      req.SubCriterionId = subCriterion.id;
      await isCriterionBelongToUser(subCriterion.CriterionId, req);
    }
  }
};

const isSuggestionBelongToUser = async (id, req) => {
  if (id) {
    const suggestion = await AUN_SUGGESTION.findByPk(id);

    if (suggestion) {
      req.SuggestionId = suggestion.id;
      await isCriterionBelongToUser(suggestion.CriterionId, req);
    }
  }
};

const isCommentBelongToUser = async (id, req) => {
  const user = req.user;
  if (id) {
    const comment = await AUN_COMMENT.findOne({
      where: {
        UserEmail: user.email,
        id: id
      }
    });

    if (comment) {
      req.CommentId = comment.id;
      await isSubCriterionBelongToUser(comment.SubCriterionId, req);
    }
  }
};

const isNoteBelongToUser = async (id, req) => {
  const user = req.user;
  if (id) {
    const note = await AUN_COMMENT.findOne({
      where: {
        UserEmail: user.email,
        id: id
      }
    });

    if (note) {
      req.NoteId = note.id;
      await isSubCriterionBelongToUser(note.SubCriterionId, req);
    }
  }
};

const isEvidenceBelongToUser = async (id, req) => {
  if (id) {
    const evidence = await AUN_EVIDENCE.findByPk(id);

    if (evidence) {
      req.EvidenceId = evidence.id;
      await isSuggestionBelongToUser(evidence.SuggestionId, req);
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

  const criterions = await AUN_CRITERION.findAll({
    where: {
      SARId: oldSAR.id
    }
  }).map(criterion => {
    return criterion.toJSON();
  });

  delete oldSAR.id;
  oldSAR.isTemplate = false;

  const newSAR = await AUN_SAR.create(oldSAR);

  for (let i = 0, iMax = criterions.length; i < iMax; i++) {
    const criterion = criterions[i];
    await cloneChildCriterion(criterion, newSAR.id);
  }

  return newSAR.id;
};

const findEvidence = async (subCriterion, findTotal = false) => {
  const content = subCriterion.content;
  const criterionId = subCriterion.CriterionId;

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

  fileKeys = _.map(fileKeys, fileKey => {
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
        // 'Suggestion.CriterionId': criterionId
        // TODO: Limit CriterionId - TESTING
      },
      include: [
        {
          model: AUN_SUGGESTION,
          as: 'Suggestion',
          where: {
            CriterionId: criterionId
          },
          required: true,
          attributes: []
        }
      ]
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

  const resContent = new XMLSerializer().serializeToString(contentDoc);
  return _.replace(resContent, /&amp;nbsp;/g, '&nbsp;');
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
