const commonRouter = require('./CommonRouter');
const SARRouter = require('./SARRouter');
const CriterionRouter = require('./CriterionRouter');
const CriteriaRouter = require('./CriteriaRouter');
const ImplicationRouter = require('./ImplicationRouter');
const DiaQuestionRouter = require('./DiaQuestionRouter');

module.exports = app => {
  app.use(commonRouter);
  app.use('/sars', SARRouter);
  app.use('/criterions', CriterionRouter);
  app.use('/criterias', CriteriaRouter);
  app.use('/implications', ImplicationRouter);
  app.use('/diaquestions', DiaQuestionRouter);
};
