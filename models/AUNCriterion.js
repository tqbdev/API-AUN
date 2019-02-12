module.exports = (sequelize, DataTypes) => {
  const AUNCriterion = sequelize.define(
    'AUNCriterion',
    {
      name: { type: DataTypes.STRING, allowNull: false },
      description: DataTypes.TEXT
    },
    {
      indexes: [
        {
          unique: true,
          fields: ['name', 'AUNSarId']
        }
      ]
    }
  );

  AUNCriterion.associate = function(models) {
    AUNCriterion.belongsTo(models.AUNSar, {
      foreignKey: {
        allowNull: false
      }
    });
  };

  return AUNCriterion;
};
