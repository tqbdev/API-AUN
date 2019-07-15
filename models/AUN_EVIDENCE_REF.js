module.exports = (sequelize, DataTypes) => {
  const AUN_EVIDENCE_REF = sequelize.define(
    'AUN_EVIDENCE_REF',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      total: DataTypes.INTEGER
    },
    {
      indexes: [
        {
          unique: true,
          name: 'Evidence ref - unique EvidenceId and SubCriterionId',
          fields: ['EvidenceId', 'SubCriterionId']
        }
      ]
    }
  );

  AUN_EVIDENCE_REF.associate = function(models) {
    AUN_EVIDENCE_REF.belongsTo(models.AUN_EVIDENCE, {
      foreignKey: {
        name: 'EvidenceId',
        allowNull: false
      },
      as: 'Evidence',
      onDelete: 'CASCADE'
    });
    AUN_EVIDENCE_REF.belongsTo(models.AUN_SUB_CRITERION, {
      foreignKey: {
        name: 'SubCriterionId',
        allowNull: false
      },
      as: 'SubCriterion',
      onDelete: 'CASCADE'
    });
  };

  return AUN_EVIDENCE_REF;
};
