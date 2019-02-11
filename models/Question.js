module.exports = (sequelize, DataTypes) => {
  const Question = sequelize.define('Question', {
    question: { type: DataTypes.TEXT, allowNull: false },
    answer: { type: DataTypes.TEXT, allowNull: false }
  });

  Question.associate = function(models) {
    Question.belongsTo(models.Criteria);
  };

  return Question;
};
