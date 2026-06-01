module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Courses', {
      id: {
        type:          Sequelize.INTEGER,
        primaryKey:    true,
        autoIncrement: true,
        allowNull:     false
      },
      name: {
        type:      Sequelize.STRING,
        allowNull: false
      },
      teacher: {
        type:      Sequelize.STRING,
        allowNull: false
      },
      level: {
        type:      Sequelize.ENUM('primaria', 'secundaria'),
        allowNull: false
      },
      createdAt: {
        type:      Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type:      Sequelize.DATE,
        allowNull: false
      }
    });
  },
  down: async (queryInterface) => queryInterface.dropTable('Courses')
};