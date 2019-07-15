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
          name: 'Criterion - unique name and ReversionId',
          fields: ['name', 'ReversionId']
        }
      ]
    }
  );

  AUN_CRITERION.associate = function(models) {
    AUN_CRITERION.belongsTo(models.AUN_REVERSION, {
      foreignKey: {
        name: 'ReversionId',
        allowNull: false
      },
      onDelete: 'CASCADE'
    });
    AUN_CRITERION.hasMany(models.AUN_SUB_CRITERION, {
      foreignKey: {
        name: 'CriterionId',
        allowNull: false
      },
      as: 'SubCriterions',
      onDelete: 'CASCADE'
    });
    AUN_CRITERION.hasMany(models.AUN_SUGGESTION, {
      foreignKey: {
        name: 'CriterionId',
        allowNull: false
      },
      as: 'Suggestions',
      onDelete: 'CASCADE'
    });
  };

  return AUN_CRITERION;
};
