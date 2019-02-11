module.exports = (sequelize, DataTypes) => {
  const Evidence = sequelize.define('Evidence', {
    type: { type: DataTypes.STRING, allowNull: false },
    content: DataTypes.TEXT,
    contentPath: DataTypes.STRING
  });

  Evidence.associate = function(models) {
    Evidence.belongsTo(models.Criteria);
  };

  return Evidence;
};
