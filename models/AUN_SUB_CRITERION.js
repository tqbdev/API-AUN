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
      as: 'Criterion',
      onDelete: 'CASCADE'
    });
    AUN_SUB_CRITERION.belongsToMany(models.AUN_COMMENT, {
      foreignKey: {
        name: 'SubCriterionId',
        allowNull: false
      },
      as: 'Comments',
      through: models.AUN_SUB_CRITERION_COMMENT,
      onDelete: 'CASCADE'
    });
    AUN_SUB_CRITERION.belongsToMany(models.AUN_EVIDENCE, {
      foreignKey: {
        name: 'SubCriterionId',
        allowNull: false
      },
      as: 'Evidences',
      through: models.AUN_EVIDENCE_REF,
      onDelete: 'CASCADE'
    });
  };

  return AUN_SUB_CRITERION;
};
