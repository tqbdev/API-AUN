// Specific routes
const CommonRouter = require('./CommonRouter');
const SARRouter = require('./SARRouter');
const CriterionRouter = require('./CriterionRouter');
const SubCriterionRouter = require('./SubCriterionRouter');
const AssignmentRouter = require('./AssignmentRouter');
const SuggestionRouter = require('./SuggestionRouter');
const CommentRouter = require('./CommentRouter');
const NoteRouter = require('./NoteRouter');
const EvidenceRouter = require('./EvidenceRouter');
const EvidenceRefRouter = require('./EvidenceRefRouter');
const UserRouter = require('./UserRouter');

// Policies
const { isAuthenticated } = require('../policies/Authenticated');
const SARControllerPolicy = require('../policies//SARControllerPolicy');
const CriterionControllerPolicy = require('../policies//CriterionControllerPolicy');
const SubCriterionControllerPolicy = require('../policies//SubCriterionControllerPolicy');
const AssignmentControllerPolicy = require('../policies//AssignmentControllerPolicy');
const SuggestionControllerPolicy = require('../policies//SuggestionControllerPolicy');
const CommentControllerPolicy = require('../policies//CommentControllerPolicy');
const NoteControllerPolicy = require('../policies//NoteControllerPolicy');
const UserControllerPolicy = require('../policies//UserControllerPolicy');
const EvidenceControllerPolicy = require('../policies//EvidenceControllerPolicy');

module.exports = app => {
  app.use(CommonRouter);
  app.use('/sars', isAuthenticated, SARControllerPolicy.permission, SARRouter);
  app.use(
    '/criterions',
    isAuthenticated,
    CriterionControllerPolicy.permission,
    CriterionRouter
  );
  app.use(
    '/subcriterions',
    isAuthenticated,
    SubCriterionControllerPolicy.permission,
    SubCriterionRouter
  );
  app.use(
    '/assignments',
    isAuthenticated,
    AssignmentControllerPolicy.permission,
    AssignmentRouter
  );
  app.use(
    '/suggestions',
    isAuthenticated,
    SuggestionControllerPolicy.permission,
    SuggestionRouter
  );
  app.use(
    '/comments',
    isAuthenticated,
    CommentControllerPolicy.permission,
    CommentRouter
  );
  app.use(
    '/notes',
    isAuthenticated,
    NoteControllerPolicy.permission,
    NoteRouter
  );
  app.use(
    '/evidences',
    isAuthenticated,
    EvidenceControllerPolicy.permission,
    EvidenceRouter
  );
  app.use(
    '/references',
    isAuthenticated,
    // EvidenceControllerPolicy.permission,
    EvidenceRefRouter
  );
  app.use(
    '/users',
    isAuthenticated,
    UserControllerPolicy.permission,
    UserRouter
  );
};
