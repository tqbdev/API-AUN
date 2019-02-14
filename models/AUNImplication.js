module.exports = (sequelize, DataTypes) => {
  const AUNImplication = sequelize.define('AUNImplication', {
    content: { type: DataTypes.TEXT, allowNull: false }
  });

  AUNImplication.associate = function(models) {
    AUNImplication.belongsTo(models.AUNCriteria, {
      foreignKey: {
        allowNull: false
      },
      onDelete: 'CASCADE'
    });
  };

  return AUNImplication;
};
