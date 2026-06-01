module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert('Courses', [
      { name: '3° B', teacher: 'Prof. García',  level: 'primaria',   createdAt: new Date(), updatedAt: new Date() },
      { name: '4° A', teacher: 'Prof. Mamani',  level: 'primaria',   createdAt: new Date(), updatedAt: new Date() },
      { name: '4° B', teacher: 'Prof. Torres',  level: 'secundaria', createdAt: new Date(), updatedAt: new Date() },
      { name: '2° A', teacher: 'Prof. Quispe',  level: 'secundaria', createdAt: new Date(), updatedAt: new Date() },
    ]);
  },
  down: async (queryInterface) => queryInterface.bulkDelete('Courses', null, {})
};