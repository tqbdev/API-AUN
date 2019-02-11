module.exports = (sequelize, DataTypes) => {
  const Report = sequelize.define('Report', {
    name: { type: DataTypes.STRING, primaryKey: true }
  });

  return Report;
};
