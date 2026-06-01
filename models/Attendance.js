const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Attendance = sequelize.define('Attendance', {
    id: {
      type:          DataTypes.INTEGER,
      primaryKey:    true,
      autoIncrement: true
    },
    studentId: {
      type:      DataTypes.INTEGER,
      allowNull: false
    },
    date: {
      type:      DataTypes.DATEONLY,
      allowNull: false
    },
    status: {
      type:      DataTypes.ENUM('presente', 'ausente', 'tardanza'),
      allowNull: false
    },
    note: {
      type:      DataTypes.TEXT,
      allowNull: true
    }
  });

  Attendance.associate = (models) => {
    Attendance.belongsTo(models.Student, { foreignKey: 'studentId' });
  };

  return Attendance;
};