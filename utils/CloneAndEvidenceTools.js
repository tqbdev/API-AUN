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
  AUN_SUGGESTION,
  AUN_EVIDENCE,
  AUN_REVERSION,
  AUN_EVIDENCE_REF,
  sequelize
} = require('../models');

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
  cloneSAR,
  cloneReversion,
  findEvidence,
  changeEvidence,
  deleteFile
};
