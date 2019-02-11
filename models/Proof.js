module.exports = (sequelize, DataTypes) => {
  const Proof = sequelize.define('Proof', {
    type: { type: DataTypes.STRING, allowNull: false },
    content: DataTypes.TEXT,
    contentPath: DataTypes.STRING
  });

  Proof.associate = function(models) {
    Proof.belongsTo(models.Criteria);
  };

  return Proof;
};
