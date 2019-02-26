const { sequelize, AUN_USER, AUN_SAR } = require('../models');

const Promise = require('bluebird');
const users = require('./users.json');
const sars = require('./sars.json');

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
  });
