const AppConstants = require('../app.constants');

module.exports = (sequelize, DataTypes) => {
  const AUN_ASSIGNMENT = sequelize.define('AUN_ASSIGNMENT', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    role: {
      type: DataTypes.ENUM,
      values: [AppConstants.ENUM.ROLE.EDITOR, AppConstants.ENUM.ROLE.REVIEWER],
      defaultValue: AppConstants.ENUM.ROLE.EDITOR,
      allowNull: false
    }
  });

  AUN_ASSIGNMENT.associate = function(models) {
    AUN_ASSIGNMENT.belongsTo(models.AUN_USER, {
      foreignKey: {
        name: 'UserEmail',
        allowNull: false
      },
      as: 'User',
      onDelete: 'CASCADE'
    });
    AUN_ASSIGNMENT.belongsToMany(models.AUN_SAR, {
      foreignKey: {
        name: 'AssignmentId',
        allowNull: false
      },
      as: 'SARs',
      through: models.AUN_SAR_ASSIGNMENT,
      onDelete: 'CASCADE'
    });
  };

  return AUN_ASSIGNMENT;
};
