module.exports = (sequelize, DataTypes) => {
  const AUN_ASSGIN = sequelize.define(
    'AUN_ASSGIN',
    {},
    {
      indexes: [
        {
          unique: true,
          name: 'Assign - unique UserEmail and SARId',
          fields: ['UserEmail', 'SARId']
        }
      ]
    }
  );

  AUN_ASSGIN.associate = function(models) {
    AUN_ASSGIN.belongsTo(models.AUN_USER, {
      foreignKey: {
        name: 'UserEmail',
        allowNull: false
      },
      onDelete: 'CASCADE'
    });
    AUN_ASSGIN.belongsTo(models.AUN_SAR, {
      foreignKey: {
        name: 'SARId',
        allowNull: false
      },
      onDelete: 'CASCADE'
    });
  };

  return AUN_ASSGIN;
};
