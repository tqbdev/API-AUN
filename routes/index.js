const commonRouter = require('./CommonRouter');
const SARRouter = require('./SARRouter');
const CriterionRouter = require('./CriterionRouter');
const SubCriterionRouter = require('./SubCriterionRouter');
const ImplicationRouter = require('./ImplicationRouter');
const DiaQuestionRouter = require('./DiaQuestionRouter');

module.exports = app => {
  app.use(commonRouter);
  app.use('/sars', SARRouter);
  app.use('/criterions', CriterionRouter);
  app.use('/subcriterions', SubCriterionRouter);
  app.use('/implications', ImplicationRouter);
  app.use('/diaquestions', DiaQuestionRouter);
};
