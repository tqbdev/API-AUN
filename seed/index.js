const { sequelize, AUN_USER } = require('../models');

const Promise = require('bluebird');
const users = require('./users.json');

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
  });
