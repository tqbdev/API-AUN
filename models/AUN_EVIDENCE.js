const AppConstants = require('../app.constants');

module.exports = (sequelize, DataTypes) => {
  const AUN_EVIDENCE = sequelize.define('AUN_EVIDENCE', {
    type: {
      type: DataTypes.ENUM,
      allowNull: false,
      values: [
        AppConstants.ENUM.EVIDENCE_TYPE.LINK,
        AppConstants.ENUM.EVIDENCE_TYPE.FILE
      ]
    },
    name: {
      type: DataTypes.STRING
    },
    link: {
      type: DataTypes.STRING,
      allowNull: false
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false
    }
  });

  AUN_EVIDENCE.associate = function(models) {
    // AUN_EVIDENCE.belongsTo(models.AUN_CRITERION, {
    //   foreignKey: {
    //     name: 'CriterionId',
    //     allowNull: false
    //   },
    //   onDelete: 'CASCADE'
    // });
    AUN_EVIDENCE.belongsTo(models.AUN_SUGGESTION, {
      foreignKey: {
        name: 'SuggestionId',
        allowNull: false
      },
      onDelete: 'CASCADE'
    });
  };

  return AUN_EVIDENCE;
};
