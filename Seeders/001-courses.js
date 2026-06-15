module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert('Courses', [
      { name: '1° A', teacher: 'Sin asignar', level: 'primaria', createdAt: new Date(), updatedAt: new Date() },
      { name: '1° B', teacher: 'Sin asignar', level: 'primaria', createdAt: new Date(), updatedAt: new Date() },
      { name: '2° A', teacher: 'Sin asignar', level: 'primaria', createdAt: new Date(), updatedAt: new Date() },
      { name: '2° B', teacher: 'Sin asignar', level: 'primaria', createdAt: new Date(), updatedAt: new Date() },
      { name: '3° A', teacher: 'Sin asignar', level: 'primaria', createdAt: new Date(), updatedAt: new Date() },
      { name: '3° B', teacher: 'Sin asignar', level: 'primaria', createdAt: new Date(), updatedAt: new Date() },
      { name: '4° A', teacher: 'Sin asignar', level: 'primaria', createdAt: new Date(), updatedAt: new Date() },
      { name: '4° B', teacher: 'Sin asignar', level: 'primaria', createdAt: new Date(), updatedAt: new Date() },
      { name: '5° A', teacher: 'Sin asignar', level: 'primaria', createdAt: new Date(), updatedAt: new Date() },
      { name: '5° B', teacher: 'Sin asignar', level: 'primaria', createdAt: new Date(), updatedAt: new Date() },
      { name: '5° C', teacher: 'Sin asignar', level: 'primaria', createdAt: new Date(), updatedAt: new Date() },
      { name: '6° A', teacher: 'Sin asignar', level: 'primaria', createdAt: new Date(), updatedAt: new Date() },
      { name: '6° B', teacher: 'Sin asignar', level: 'primaria', createdAt: new Date(), updatedAt: new Date() },
      { name: '6° C', teacher: 'Sin asignar', level: 'primaria', createdAt: new Date(), updatedAt: new Date() },
    ]);
  },
  down: async (queryInterface) => queryInterface.bulkDelete('Courses', null, {})
};