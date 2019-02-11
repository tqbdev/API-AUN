module.exports = (sequelize, DataTypes) => {
  const Standard = sequelize.define('Standard', {
    name: { type: DataTypes.STRING, allowNull: false },
    description: DataTypes.TEXT
  });

  Standard.associate = function(models) {
    Standard.belongsTo(models.Report);
  };

  return Standard;
};
