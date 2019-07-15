module.exports = (sequelize, DataTypes) => {
  const AUN_COMMENT = sequelize.define('AUN_COMMENT', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.TEXT
    },
    content: {
      type: DataTypes.TEXT
    },
    isNote: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    isEditor: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  });

  AUN_COMMENT.associate = function(models) {
    AUN_COMMENT.belongsTo(models.AUN_USER, {
      foreignKey: {
        name: 'UserEmail',
        allowNull: false
      },
      as: 'User',
      onDelete: 'CASCADE'
    });
    // AUN_COMMENT.belongsTo(models.AUN_SUB_CRITERION, {
    //   foreignKey: {
    //     name: 'SubCriterionId',
    //     allowNull: false
    //   },
    //   as: 'SubCriterion',
    //   onDelete: 'CASCADE'
    // });
    AUN_COMMENT.belongsToMany(models.AUN_SUB_CRITERION, {
      foreignKey: {
        name: 'CommentId',
        allowNull: false
      },
      as: 'SubCriterions',
      through: models.AUN_SUB_CRITERION_COMMENT,
      onDelete: 'CASCADE'
    });
  };

  return AUN_COMMENT;
};
