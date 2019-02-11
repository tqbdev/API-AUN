module.exports = (sequelize, DataTypes) => {
  const Criteria = sequelize.define('Criteria', {
    name: { type: DataTypes.STRING, allowNull: false },
    description: DataTypes.TEXT
  });

  Criteria.associate = function(models) {
    Criteria.belongsTo(models.Criterion);
  };

  return Criteria;
};
