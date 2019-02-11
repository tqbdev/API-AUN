module.exports = (sequelize, DataTypes) => {
  const DiaQuestion = sequelize.define('DiaQuestion', {
    question: { type: DataTypes.TEXT, allowNull: false },
    answer: { type: DataTypes.TEXT, allowNull: false }
  });

  DiaQuestion.associate = function(models) {
    DiaQuestion.belongsTo(models.Criteria);
  };

  return DiaQuestion;
};
