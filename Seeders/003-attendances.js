module.exports = {
  up: async (queryInterface) => {
    const today = new Date().toISOString().split('T')[0];

    await queryInterface.bulkInsert('Attendances', [
      { studentId: 1, date: today, status: 'presente', note: null, createdAt: new Date(), updatedAt: new Date() },
      { studentId: 2, date: today, status: 'ausente', note: 'Enfermo', createdAt: new Date(), updatedAt: new Date() },
      { studentId: 3, date: today, status: 'presente', note: null, createdAt: new Date(), updatedAt: new Date() },
      { studentId: 4, date: today, status: 'tardanza', note: 'Llegó 10 min tarde', createdAt: new Date(), updatedAt: new Date() },
      { studentId: 5, date: today, status: 'presente', note: null, createdAt: new Date(), updatedAt: new Date() },
      { studentId: 6, date: today, status: 'presente', note: null, createdAt: new Date(), updatedAt: new Date() },
      { studentId: 7, date: today, status: 'tardanza', note: null, createdAt: new Date(), updatedAt: new Date() },
      { studentId: 8, date: today, status: 'ausente', note: 'Sin justificación', createdAt: new Date(), updatedAt: new Date() },
    ]);
  },

  down: async (queryInterface) => queryInterface.bulkDelete('Attendances', null, {})
};