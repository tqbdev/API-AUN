const { sequelize, AUN_USER } = require('../models');

const Promise = require('bluebird');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');

const users = [
  {
    email: '1512029@student.hcmus.edu.vn',
    password: '1512029@Tqb',
    name: '1512029',
    isAdmin: true
  },
  {
    email: 'lqvu@fit.hcmus.edu.vn',
    password: 'Admin123',
    name: 'Vu Lam',
    isAdmin: true
  }
];

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

    const queries = fs
      .readFileSync(path.join(__dirname, 'aun_data_dump.sql'))
      .toString()
      .split(/;\n/);

    for (let i = 0, iMax = +_.get(queries, 'length'); i < iMax; i++) {
      const query = queries[i];
      if (!query.trim()) continue;
      await sequelize.query(query, {
        type: sequelize.QueryTypes.INSERT
      });
    }

    process.exit(0);
  });
