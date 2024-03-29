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
      id: {
        type: DataTypes.INTEGER,
        unique: true,
        autoIncrement: true
      },
      email: {
        type: DataTypes.STRING,
        primaryKey: true
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING
      },
      phone: {
        type: DataTypes.STRING
      },
      isAdmin: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
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

  AUN_USER.associate = function(models) {
    AUN_USER.hasMany(models.AUN_ASSIGNMENT, {
      foreignKey: {
        name: 'UserEmail',
        allowNull: false
      },
      as: 'Assignments',
      // through: models.AUN_ASSIGNMENT,
      onDelete: 'CASCADE'
    });
    // AUN_USER.belongsToMany(models.AUN_SUB_CRITERION, {
    //   foreignKey: {
    //     name: 'UserEmail',
    //     allowNull: false
    //   },
    //   as: 'SubCriterions',
    //   through: models.AUN_COMMENT,
    //   onDelete: 'CASCADE'
    // });
    AUN_USER.hasMany(models.AUN_COMMENT, {
      foreignKey: {
        name: 'UserEmail',
        allowNull: false
      },
      as: 'Comments',
      onDelete: 'CASCADE'
    });
    AUN_USER.hasMany(models.AUN_REFRESH_TOKEN, {
      foreignKey: {
        name: 'UserEmail',
        allowNull: false
      },
      as: 'RefreshTokens',
      onDelete: 'CASCADE'
    });
  };

  return AUN_USER;
};
