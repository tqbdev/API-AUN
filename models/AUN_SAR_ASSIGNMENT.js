const AppConstants = require('../app.constants');

module.exports = (sequelize, DataTypes) => {
  const AUN_SAR_ASSIGNMENT = sequelize.define('AUN_SAR_ASSIGNMENT', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    }
  });

  AUN_SAR_ASSIGNMENT.associate = function(models) {
    AUN_SAR_ASSIGNMENT.belongsTo(models.AUN_ASSIGNMENT, {
      foreignKey: {
        name: 'AssignmentId',
        allowNull: false
      },
      as: 'Assignment',
      onDelete: 'CASCADE'
    });
    AUN_SAR_ASSIGNMENT.belongsTo(models.AUN_SAR, {
      foreignKey: {
        name: 'SARId',
        allowNull: false
      },
      as: 'SAR',
      onDelete: 'CASCADE'
    });
  };

  return AUN_SAR_ASSIGNMENT;
};
