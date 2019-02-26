module.exports = (sequelize, DataTypes) => {
  const AUN_ASSIGNMENT = sequelize.define(
    'AUN_ASSIGNMENT',
    {},
    {
      indexes: [
        {
          unique: true,
          name: 'Assignment - unique UserEmail and SARId',
          fields: ['UserEmail', 'SARId']
        }
      ]
    }
  );

  AUN_ASSIGNMENT.associate = function(models) {
    AUN_ASSIGNMENT.belongsTo(models.AUN_USER, {
      foreignKey: {
        name: 'UserEmail',
        allowNull: false
      },
      onDelete: 'CASCADE'
    });
    AUN_ASSIGNMENT.belongsTo(models.AUN_SAR, {
      foreignKey: {
        name: 'SARId',
        allowNull: false
      },
      onDelete: 'CASCADE'
    });
  };

  return AUN_ASSIGNMENT;
};
