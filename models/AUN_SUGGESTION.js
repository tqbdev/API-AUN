const AppConstants = require('../app.constants');

module.exports = (sequelize, DataTypes) => {
  const AUN_SUGGESTION = sequelize.define('AUN_SUGGESTION', {
    type: {
      type: DataTypes.ENUM,
      allowNull: false,
      values: [
        AppConstants.ENUM.SUGGESTION_TYPE.EVIDENCE,
        AppConstants.ENUM.SUGGESTION_TYPE.IMPLICATION,
        AppConstants.ENUM.SUGGESTION_TYPE.QUESTION
      ]
    },
    content: {
      type: DataTypes.TEXT
    },
    status: {
      type: DataTypes.ENUM,
      allowNull: false,
      values: [
        AppConstants.ENUM.STATUS.TODO,
        AppConstants.ENUM.STATUS.DOING,
        AppConstants.ENUM.STATUS.DONE
      ],
      defaultValue: AppConstants.ENUM.STATUS.TODO
    }
  });

  AUN_SUGGESTION.associate = function(models) {
    AUN_SUGGESTION.belongsTo(models.AUN_CRITERION, {
      foreignKey: {
        name: 'CriterionId',
        allowNull: false
      },
      onDelete: 'CASCADE'
    });
  };

  return AUN_SUGGESTION;
};
