module.exports = (sequelize, DataTypes) => {
  const AUN_IMPLICATION = sequelize.define('AUN_IMPLICATION', {
    content: { type: DataTypes.TEXT, allowNull: false }
  });

  AUN_IMPLICATION.associate = function(models) {
    AUN_IMPLICATION.belongsTo(models.AUN_SUB_CRITERION, {
      foreignKey: {
        name: 'SubCriterionId',
        allowNull: false
      },
      onDelete: 'CASCADE'
    });
  };

  return AUN_IMPLICATION;
};
