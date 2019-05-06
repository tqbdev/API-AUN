const AppConstants = require('../app.constants');

module.exports = (sequelize, DataTypes) => {
  const AUN_SUB_CRITERION_COMMENT = sequelize.define(
    'AUN_SUB_CRITERION_COMMENT',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      }
    }
  );

  AUN_SUB_CRITERION_COMMENT.associate = function(models) {
    AUN_SUB_CRITERION_COMMENT.belongsTo(models.AUN_COMMENT, {
      foreignKey: {
        name: 'CommentId',
        allowNull: false
      },
      as: 'Comment',
      onDelete: 'CASCADE'
    });
    AUN_SUB_CRITERION_COMMENT.belongsTo(models.AUN_SUB_CRITERION, {
      foreignKey: {
        name: 'SubCriterionId',
        allowNull: false
      },
      as: 'SubCriterion',
      onDelete: 'CASCADE'
    });
  };

  return AUN_SUB_CRITERION_COMMENT;
};
