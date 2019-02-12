module.exports = (sequelize, DataTypes) => {
  const AUNSar = sequelize.define('AUNSar', {
    name: { type: DataTypes.STRING, unique: true }
  });

  return AUNSar;
};
