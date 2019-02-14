module.exports = (sequelize, DataTypes) => {
  const AUNCriteria = sequelize.define(
    'AUNCriteria',
    {
      name: { type: DataTypes.STRING, allowNull: false },
      description: DataTypes.TEXT
    },
    {
      indexes: [
        {
          unique: true,
          fields: ['name', 'AUNCriterionId']
        }
      ]
    }
  );

  AUNCriteria.associate = function(models) {
    AUNCriteria.belongsTo(models.AUNCriterion, {
      foreignKey: {
        allowNull: false
      },
      onDelete: 'CASCADE'
    });
  };

  return AUNCriteria;
};
