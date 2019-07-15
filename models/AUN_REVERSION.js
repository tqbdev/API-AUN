module.exports = (sequelize, DataTypes) => {
  const AUN_REVERSION = sequelize.define(
    'AUN_REVERSION',
    {
      version: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      isRelease: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    },
    {
      indexes: [
        {
          unique: true,
          name: 'Criterion - unique version and SARId and isRelease',
          fields: ['version', 'SARId', 'isRelease']
        }
      ]
    }
  );

  AUN_REVERSION.associate = function(models) {
    AUN_REVERSION.belongsTo(models.AUN_SAR, {
      foreignKey: {
        name: 'SARId',
        allowNull: false
      },
      as: 'SAR',
      onDelete: 'CASCADE'
    });
    AUN_REVERSION.hasMany(models.AUN_CRITERION, {
      foreignKey: {
        name: 'ReversionId',
        allowNull: false
      },
      as: 'Criterions',
      onDelete: 'CASCADE'
    });
  };

  return AUN_REVERSION;
};
