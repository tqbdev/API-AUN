module.exports = (sequelize, DataTypes) => {
  const AUN_SAR = sequelize.define('AUN_SAR', {
    name: { type: DataTypes.STRING, unique: true }
  });

  return AUN_SAR;
};
