module.exports = (sequelize, DataTypes) => {
  const Implication = sequelize.define('Implication', {
    content: { type: DataTypes.TEXT, allowNull: false }
  });

  Implication.associate = function(models) {
    Implication.belongsTo(models.Criteria);
  };

  return Implication;
};
