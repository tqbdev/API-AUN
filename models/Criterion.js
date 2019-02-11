module.exports = (sequelize, DataTypes) => {
  const Criterion = sequelize.define('Criterion', {
    name: { type: DataTypes.STRING, allowNull: false },
    description: DataTypes.TEXT
  });

  Criterion.associate = function(models) {
    Criterion.belongsTo(models.SAR);
  };

  return Criterion;
};
