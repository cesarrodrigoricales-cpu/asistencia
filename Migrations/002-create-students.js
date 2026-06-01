module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Students', {
      id:        { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name:      { type: Sequelize.STRING,  allowNull: false },
      courseId:  {
        type:       Sequelize.INTEGER,
        allowNull:  false,
        references: { model: 'Courses', key: 'id' },
        onUpdate:   'CASCADE',
        onDelete:   'CASCADE'
      },
      level:     { type: Sequelize.ENUM('primaria', 'secundaria'), allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });
  },
  down: async (queryInterface) => queryInterface.dropTable('Students')
};