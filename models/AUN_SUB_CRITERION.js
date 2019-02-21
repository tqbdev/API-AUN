module.exports = (sequelize, DataTypes) => {
  const AUN_SUB_CRITERION = sequelize.define(
    'AUN_SUB_CRITERION',
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      content: {
        type: DataTypes.TEXT
      }
    },
    {
      indexes: [
        {
          unique: true,
          name: 'SubCriterion - unique name and CriterionId',
          fields: ['name', 'CriterionId']
        }
      ]
    }
  );

  AUN_SUB_CRITERION.associate = function(models) {
    AUN_SUB_CRITERION.belongsTo(models.AUN_CRITERION, {
      foreignKey: {
        name: 'CriterionId',
        allowNull: false
      },
      onDelete: 'CASCADE'
    });
  };

  return AUN_SUB_CRITERION;
};
