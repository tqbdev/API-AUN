module.exports = (sequelize, DataTypes) => {
  const AUN_COMMENT = sequelize.define(
    'AUN_COMMENT',
    {
      content: {
        type: DataTypes.TEXT
      }
    },
    {
      indexes: [
        {
          unique: true,
          name: 'Comment - unique UserEmail and SuggestionId',
          fields: ['UserEmail', 'SuggestionId']
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
    AUN_COMMENT.belongsTo(models.AUN_SUGGESTION, {
      foreignKey: {
        name: 'SuggestionId',
        allowNull: false
      },
      onDelete: 'CASCADE'
    });
  };

  return AUN_COMMENT;
};
