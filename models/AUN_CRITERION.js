module.exports = (sequelize, DataTypes) => {
  const AUN_CRITERION = sequelize.define(
    'AUN_CRITERION',
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT
      }
    },
    {
      indexes: [
        {
          unique: true,
          name: 'Criterion - unique name and SARId',
          fields: ['name', 'SARId']
        }
      ]
    }
  );

  AUN_CRITERION.associate = function(models) {
    AUN_CRITERION.belongsTo(models.AUN_SAR, {
      foreignKey: {
        name: 'SARId',
        allowNull: false
      },
      onDelete: 'CASCADE'
    });
    AUN_CRITERION.hasMany(models.AUN_SUB_CRITERION, {
      foreignKey: {
        name: 'CriterionId',
        allowNull: false
      },
      as: 'SubCriterion',
      onDelete: 'CASCADE'
    });
    AUN_CRITERION.hasMany(models.AUN_SUGGESTION, {
      foreignKey: {
        name: 'CriterionId',
        allowNull: false
      },
      as: 'Suggestion',
      onDelete: 'CASCADE'
    });
  };

  return AUN_CRITERION;
};
