const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Course = sequelize.define('Course', {
    id: {
      type:          DataTypes.INTEGER,
      primaryKey:    true,
      autoIncrement: true
    },
    name: {
      type:      DataTypes.STRING,
      allowNull: false
    },
    teacher: {
      type:      DataTypes.STRING,
      allowNull: false
    },
    level: {
      type:      DataTypes.ENUM('primaria', 'secundaria'),
      allowNull: false
    }
  });

  Course.associate = (models) => {
    Course.hasMany(models.Student, { foreignKey: 'courseId' });
  };

  return Course;
};