module.exports = (sequelize, DataTypes) => {
  const AUN_COMMENT = sequelize.define(
    'AUN_COMMENT',
    {
      title: {
        type: DataTypes.TEXT
      },
      content: {
        type: DataTypes.TEXT
      }
    },
    {
      indexes: [
        {
          unique: true,
          name: 'Comment - unique UserEmail and SubCriterionId',
          fields: ['UserEmail', 'SubCriterionId']
        }
      ]
    }
  );

  AUN_COMMENT.associate = function(models) {
    AUN_COMMENT.belongsTo(models.AUN_USER, {
      foreignKey: {
        name: 'UserEmail',
        allowNull: false
      },
      onDelete: 'CASCADE'
    });
    AUN_COMMENT.belongsTo(models.AUN_SUB_CRITERION, {
      foreignKey: {
        name: 'SubCriterionId',
        allowNull: false
      },
      onDelete: 'CASCADE'
    });
  };

  return AUN_COMMENT;
};
