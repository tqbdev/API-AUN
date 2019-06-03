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
  AUN_EVIDENCE,
  AUN_REVERSION,
  AUN_EVIDENCE_REF,
  sequelize
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
      } else if (SAR.isAssigned && req.method !== 'GET') {
        throw new Error('405');
      }
    } else {
      if (!assignment) {
        throw new Error('403');
      } else {
        if (req.role === AppContanst.ENUM.ROLE.EDITOR) {
          if (assignment.role !== req.role) {
            throw new Error('403');
          } else if (!req.isNewestReversion && req.point !== 'REVERSION') {
            throw new Error('405');
          }
        }
        req.role = assignment.role;
      }
    }

    req.SARId = id;
  }
};

const isReversionBelongToUser = async (id, req) => {
  if (id) {
    const reversion = await AUN_REVERSION.findByPk(id);

    if (reversion) {
      req.ReversionId = reversion.id;

      const newestReversion = await AUN_REVERSION.findOne({
        where: {
          SARId: reversion.SARId
        },
        order: [['version', 'DESC']]
      });

      req.isNewestReversion = reversion.id === newestReversion.id;

      await isSARBelongToUser(reversion.SARId, req);
    }
  }
};

const isCriterionBelongToUser = async (id, req) => {
  if (id) {
    const criterion = await AUN_CRITERION.findByPk(id);

    if (criterion) {
      req.CriterionId = criterion.id;
      await isReversionBelongToUser(criterion.ReversionId, req);
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

const cloneChildCriterion = async (criterion, ReversionId) => {
  let oldCriterion = _.cloneDeep(criterion);
  delete oldCriterion.id;
  oldCriterion.ReversionId = ReversionId;
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
  }).map(item => {
    return item.toJSON();
  });

  for (let i = 0, iMax = suggestions.length; i < iMax; i++) {
    const suggestion = suggestions[i];
    await cloneEvidence(suggestion, newCriterion.id);
  }
};

const cloneEvidence = async (suggestion, CriterionId) => {
  let oldSuggestion = _.cloneDeep(suggestion);
  delete oldSuggestion.id;
  oldSuggestion.CriterionId = CriterionId;
  const newSuggestion = await AUN_SUGGESTION.create(oldSuggestion);

  let evidences = await AUN_EVIDENCE.findAll({
    where: {
      SuggestionId: suggestion.id
    }
  });

  evidences = _.map(evidences, evidence => {
    let value = evidence.toJSON();
    delete value.id;
    value.SuggestionId = newSuggestion.id;
    return value;
  });

  await AUN_EVIDENCE.bulkCreate(evidences);
};

const cloneSAR = async oldSARId => {
  let oldSAR = await AUN_SAR.findByPk(oldSARId);

  oldSAR = oldSAR.toJSON();

  const oldReversion = await AUN_REVERSION.findOne({
    where: {
      SARId: oldSAR.id
    },
    order: [['createdAt', 'DESC']]
  });

  const criterions = await AUN_CRITERION.findAll({
    where: {
      ReversionId: _.get(oldReversion, 'id')
    }
  }).map(criterion => {
    return criterion.toJSON();
  });

  delete oldSAR.id;
  oldSAR.isTemplate = false;

  const newSAR = await AUN_SAR.create(oldSAR);

  const reversion = await AUN_REVERSION.create({
    SARId: newSAR.id
  });

  for (let i = 0, iMax = criterions.length; i < iMax; i++) {
    const criterion = criterions[i];
    await cloneChildCriterion(criterion, reversion.id);
  }

  return newSAR.id;
};

const cloneReversion = async (reversionId, isRelease = false) => {
  let oldReversion = await AUN_REVERSION.findByPk(reversionId);
  oldReversion = oldReversion.toJSON();

  const total = await AUN_REVERSION.count({
    where: {
      SARId: oldReversion.SARId,
      isRelease: isRelease
    }
  });

  const criterions = await AUN_CRITERION.findAll({
    where: {
      ReversionId: oldReversion.id
    }
  }).map(criterion => {
    return criterion.toJSON();
  });

  const newReversion = await AUN_REVERSION.create({
    SARId: oldReversion.SARId,
    version: +total + 1,
    isRelease: isRelease
  });

  for (let i = 0, iMax = criterions.length; i < iMax; i++) {
    const criterion = criterions[i];
    await cloneChildCriterion(criterion, newReversion.id);
  }

  // Clone evidence ref
  const subCriterions = await sequelize.query(
    'SELECT * FROM AUN_SUB_CRITERIONs WHERE CriterionId IN (SELECT id FROM AUN_CRITERIONs WHERE ReversionId = :ReversionId)',
    {
      replacements: { ReversionId: newReversion.id },
      type: sequelize.QueryTypes.SELECT
    }
  );

  for (let i = 0, iMax = subCriterions.length; i < iMax; i++) {
    const subCriterion = subCriterions[i];
    const evidences = await findEvidence(subCriterion, true);
    if (evidences) {
      for (let j = 0, jMax = evidences.length; j < jMax; j++) {
        const evidence = evidences[j];
        await AUN_EVIDENCE_REF.create({
          SubCriterionId: subCriterion.id,
          EvidenceId: evidence.id,
          total: evidence.total
        });
      }
    }
  }

  return newReversion;
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
  isReversionBelongToUser,
  isCriterionBelongToUser,
  isSubCriterionBelongToUser,
  isSuggestionBelongToUser,
  isCommentBelongToUser,
  isNoteBelongToUser,
  isEvidenceBelongToUser,
  cloneSAR,
  cloneReversion,
  findEvidence,
  changeEvidence,
  deleteFile
};
