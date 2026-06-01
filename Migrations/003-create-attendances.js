// migrations/002-create-attendances.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Attendances', {
      id:        { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      studentId: { type: Sequelize.INTEGER, references: { model: 'Students', key: 'id' } },
      date:      { type: Sequelize.DATEONLY, allowNull: false },
      status:    { type: Sequelize.ENUM('presente', 'ausente', 'tardanza'), allowNull: false },
      note:      { type: Sequelize.TEXT },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    });
  },
  down: async (queryInterface) => queryInterface.dropTable('Attendances')
};