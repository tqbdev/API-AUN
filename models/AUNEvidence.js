module.exports = (sequelize, DataTypes) => {
  const AUNEvidence = sequelize.define('AUNEvidence', {
    type: { type: DataTypes.STRING, allowNull: false },
    content: DataTypes.TEXT,
    contentPath: DataTypes.STRING
  });

  AUNEvidence.associate = function(models) {
    AUNEvidence.belongsTo(models.AUNCriteria, {
      foreignKey: {
        allowNull: false
      },
      onDelete: 'CASCADE'
    });
  };

  return AUNEvidence;
};
