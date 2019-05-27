const {
  sequelize,
  AUN_USER,
  AUN_SAR,
  AUN_CRITERION,
  AUN_SUGGESTION,
  AUN_SUB_CRITERION,
  AUN_ASSIGNMENT
} = require('../models');

const Promise = require('bluebird');
const users = require('./users.json');
const sars = require('./sars.json');
const criterions = require('./criterions.json');
const subCriterions = require('./subCriterions.json');
const suggestions = require('./suggestions.json');
const assignments = require('./assignments.json');

sequelize
  .sync({
    force: true
  })
  .then(async function() {
    await Promise.all(
      users.map(user => {
        AUN_USER.create(user);
      })
    );

    await Promise.all(
      sars.map(sar => {
        AUN_SAR.create(sar);
      })
    );

    await Promise.all(
      criterions.map(criterion => {
        AUN_CRITERION.create(criterion);
      })
    );

    await Promise.all(
      subCriterions.map(subCriterion => {
        AUN_SUB_CRITERION.create(subCriterion);
      })
    );

    await Promise.all(
      suggestions.map(sugestion => {
        AUN_SUGGESTION.create(sugestion);
      })
    );

    // await Promise.all(
    //   assignments.map(assignment => {
    //     AUN_ASSIGNMENT.create(assignment);
    //   })
    // );
  });
