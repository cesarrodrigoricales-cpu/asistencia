module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert('Students', [
      // Primaria - 3° B (id: 13)
      { name: 'María García',    courseId: 1, level: 'primaria',   createdAt: new Date(), updatedAt: new Date() },
      { name: 'Juan Pérez',      courseId: 1, level: 'primaria',   createdAt: new Date(), updatedAt: new Date() },
      { name: 'Lucía Flores',    courseId: 1, level: 'primaria',   createdAt: new Date(), updatedAt: new Date() },
      { name: 'Carlos Mendoza',  courseId: 1, level: 'primaria',   createdAt: new Date(), updatedAt: new Date() },
      { name: 'Sofía Ríos',      courseId: 1, level: 'primaria',   createdAt: new Date(), updatedAt: new Date() },
      // Primaria - 4° A (id: 14)
      { name: 'Diego Cárdenas',  courseId: 2, level: 'primaria',   createdAt: new Date(), updatedAt: new Date() },
      { name: 'Valeria Soto',    courseId: 2, level: 'primaria',   createdAt: new Date(), updatedAt: new Date() },
      { name: 'Mateo Huanca',    courseId: 2, level: 'primaria',   createdAt: new Date(), updatedAt: new Date() },
      // Secundaria - 4° B (id: 15)
      { name: 'Ana Rodríguez',   courseId: 3, level: 'secundaria', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Luis Vargas',     courseId: 3, level: 'secundaria', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Camila Paredes',  courseId: 3, level: 'secundaria', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Rodrigo Mamani',  courseId: 3, level: 'secundaria', createdAt: new Date(), updatedAt: new Date() },
      // Secundaria - 2° A (id: 16)
      { name: 'Fernanda Chávez', courseId: 4, level: 'secundaria', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Sebastián Cruz',  courseId: 4, level: 'secundaria', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Isabella Mora',   courseId: 4, level: 'secundaria', createdAt: new Date(), updatedAt: new Date() },
    ]);
  },
  down: async (queryInterface) => queryInterface.bulkDelete('Students', null, {})
};