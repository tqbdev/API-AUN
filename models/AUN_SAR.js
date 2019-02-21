const AppConstants = require('../app.constants');

module.exports = (sequelize, DataTypes) => {
  const AUN_SAR = sequelize.define(
    'AUN_SAR',
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      isTemplate: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      reversion: {
        type: DataTypes.STRING
      },
      status: {
        type: DataTypes.ENUM,
        values: [
          AppConstants.ENUM.STATUS.TODO,
          AppConstants.ENUM.STATUS.DOING,
          AppConstants.ENUM.STATUS.DONE,
          AppConstants.ENUM.STATUS.REVIEWED
        ],
        defaultValue: AppConstants.ENUM.STATUS.TODO,
        allowNull: false
      }
    },
    {
      indexes: [
        {
          unique: true,
          name: 'SAR - unique name and reversion',
          fields: ['name', 'reversion', 'isTemplate']
        }
      ]
    }
  );

  return AUN_SAR;
};
