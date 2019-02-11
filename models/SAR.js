module.exports = (sequelize, DataTypes) => {
  const SAR = sequelize.define('SAR', {
    name: { type: DataTypes.STRING, primaryKey: true }
  });

  return SAR;
};
