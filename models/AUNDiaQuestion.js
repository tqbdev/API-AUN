module.exports = (sequelize, DataTypes) => {
  const AUNDiaQuestion = sequelize.define('AUNDiaQuestion', {
    question: { type: DataTypes.TEXT, allowNull: false },
    answer: { type: DataTypes.TEXT }
  });

  AUNDiaQuestion.associate = function(models) {
    AUNDiaQuestion.belongsTo(models.AUNCriteria, {
      foreignKey: {
        allowNull: false
      }
    });
  };

  return AUNDiaQuestion;
};
