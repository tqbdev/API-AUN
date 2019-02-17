module.exports = (sequelize, DataTypes) => {
  const AUN_QUESTION = sequelize.define('AUN_QUESTION', {
    question: { type: DataTypes.TEXT, allowNull: false },
    answer: { type: DataTypes.TEXT }
  });

  AUN_QUESTION.associate = function(models) {
    AUN_QUESTION.belongsTo(models.AUN_SUB_CRITERION, {
      foreignKey: {
        name: 'SubCriterionId',
        allowNull: false
      },
      onDetele: 'CASCADE'
    });
  };

  return AUN_QUESTION;
};
