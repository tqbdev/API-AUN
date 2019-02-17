const Promise = require('bluebird');
const bcrypt = Promise.promisifyAll(require('bcrypt-nodejs'));

function hashPassword(user, options) {
  const SALT_FACTOR = 8;

  if (!user.changed('password')) {
    return;
  }

  return bcrypt
    .genSaltAsync(SALT_FACTOR)
    .then(salt => bcrypt.hashAsync(user.password, salt, null))
    .then(hash => user.setDataValue('password', hash));
}

module.exports = (sequelize, DataTypes) => {
  const AUN_USER = sequelize.define(
    'AUN_USER',
    {
      email: {
        type: DataTypes.STRING,
        primaryKey: true
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      name: DataTypes.STRING,
      phone: DataTypes.STRING,
      isAdmin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      refreshToken: DataTypes.TEXT
    },
    {
      hooks: {
        beforeCreate: hashPassword,
        beforeUpdate: hashPassword
      }
    }
  );

  AUN_USER.prototype.comparePassword = function(password) {
    return bcrypt.compareAsync(password, this.password);
  };

  return AUN_USER;
};
