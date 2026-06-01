const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Student = sequelize.define('Student', {
    id: {
      type:          DataTypes.INTEGER,
      primaryKey:    true,
      autoIncrement: true
    },
    name: {
      type:      DataTypes.STRING,
      allowNull: false
    },
    courseId: {
      type:      DataTypes.INTEGER,
      allowNull: false
    },
    level: {
      type:      DataTypes.ENUM('primaria', 'secundaria'),
      allowNull: false
    }
  });

  Student.associate = (models) => {
    Student.belongsTo(models.Course,     { foreignKey: 'courseId' });
    Student.hasMany(models.Attendance,   { foreignKey: 'studentId' });
  };

  return Student;
};