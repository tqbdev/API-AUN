module.exports = (sequelize, DataTypes) => {
  const AUN_EVIDENCE = sequelize.define('AUN_EVIDENCE', {
    type: { type: DataTypes.STRING, allowNull: false },
    content: DataTypes.TEXT,
    contentPath: DataTypes.STRING
  });

  AUN_EVIDENCE.associate = function(models) {
    AUN_EVIDENCE.belongsTo(models.AUN_SUB_CRITERION, {
      foreignKey: {
        name: 'SubCriterionId',
        allowNull: false
      },
      onDelete: 'CASCADE'
    });
  };

  return AUN_EVIDENCE;
};
