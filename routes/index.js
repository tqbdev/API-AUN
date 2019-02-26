// Specific routes
const CommonRouter = require('./CommonRouter');
const SARRouter = require('./SARRouter');
const CriterionRouter = require('./CriterionRouter');
const SubCriterionRouter = require('./SubCriterionRouter');
const AssignmentRouter = require('./AssignmentRouter');
const SuggestionRouter = require('./SuggestionRouter');
const CommentRouter = require('./CommentRouter');
const EvidenceRouter = require('./EvidenceRouter');
const UserRouter = require('./UserRouter');

// Policies
const { isAuthenticated } = require('../policies/Authenticated');
const SARControllerPolicy = require('../policies//SARControllerPolicy');
const CriterionControllerPolicy = require('../policies//CriterionControllerPolicy');
const SubCriterionControllerPolicy = require('../policies//SubCriterionControllerPolicy');
const AssignmentControllerPolicy = require('../policies//AssignmentControllerPolicy');
const SuggestionControllerPolicy = require('../policies//SuggestionControllerPolicy');
const CommentControllerPolicy = require('../policies//CommentControllerPolicy');
const UserControllerPolicy = require('../policies//UserControllerPolicy');

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
    '/evidences',
    isAuthenticated,
    // CommentControllerPolicy.permission,
    EvidenceRouter
  );
  app.use(
    '/users',
    isAuthenticated,
    UserControllerPolicy.permission,
    UserRouter
  );
};
