const _ = require('lodash');

const AppContanst = require('../app.constants');

const {
  AUN_SAR,
  AUN_CRITERION,
  AUN_SUB_CRITERION,
  AUN_ASSIGNMENT,
  AUN_SUGGESTION,
  AUN_COMMENT,
  AUN_EVIDENCE,
  AUN_REVERSION
} = require('../models');

const isSARBelongToUser = async (id, req) => {
  if (id) {
    const user = req.user;
    const assignments = await AUN_ASSIGNMENT.findAll({
      attributes: ['role'],
      where: {
        UserEmail: user.email
      },
      include: [
        {
          model: AUN_SAR,
          as: 'SARs',
          attributes: [],
          where: {
            id: id
          }
        }
      ]
    }).map(assignment => {
      return assignment.toJSON().role;
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
      if (_.isEmpty(assignments)) {
        throw new Error('403');
      } else {
        if (req.role === AppContanst.ENUM.ROLE.EDITOR) {
          // if (assignment.role !== req.role) {
          if (!_.includes(assignments, req.role)) {
            throw new Error('403');
          } else if (!req.isNewestReversion && req.point !== 'REVERSION') {
            throw new Error('405');
          }
        }
        req.roles = assignments;
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
      req.isRelease = reversion.isRelease;

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

module.exports = {
  isSARBelongToUser,
  isReversionBelongToUser,
  isCriterionBelongToUser,
  isSubCriterionBelongToUser,
  isSuggestionBelongToUser,
  isCommentBelongToUser,
  isNoteBelongToUser,
  isEvidenceBelongToUser
};
