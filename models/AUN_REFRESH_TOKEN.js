const AppConstants = require('../app.constants');

module.exports = (sequelize, DataTypes) => {
  const AUN_REFRESH_TOKEN = sequelize.define('AUN_REFRESH_TOKEN', {
    isRevoke: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    refreshToken: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    expiredAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
  });

  AUN_REFRESH_TOKEN.associate = function(models) {
    AUN_REFRESH_TOKEN.belongsTo(models.AUN_USER, {
      foreignKey: {
        name: 'UserEmail',
        allowNull: false
      },
      as: 'User',
      onDelete: 'CASCADE'
    });
  };

  return AUN_REFRESH_TOKEN;
};
