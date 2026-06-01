module.exports = {
  up: async (queryInterface) => {
    const today = new Date().toISOString().split('T')[0];
    await queryInterface.bulkInsert('Attendances', [
      { studentId: 46, date: today, status: 'presente', note: null,                    createdAt: new Date(), updatedAt: new Date() },
      { studentId: 47, date: today, status: 'ausente',  note: 'Enfermo',               createdAt: new Date(), updatedAt: new Date() },
      { studentId: 48, date: today, status: 'presente', note: null,                    createdAt: new Date(), updatedAt: new Date() },
      { studentId: 49, date: today, status: 'tardanza', note: 'Llegó 10 min tarde',    createdAt: new Date(), updatedAt: new Date() },
      { studentId: 50, date: today, status: 'presente', note: null,                    createdAt: new Date(), updatedAt: new Date() },
      { studentId: 54, date: today, status: 'presente', note: null,                    createdAt: new Date(), updatedAt: new Date() },
      { studentId: 55, date: today, status: 'tardanza', note: null,                    createdAt: new Date(), updatedAt: new Date() },
      { studentId: 56, date: today, status: 'ausente',  note: 'Sin justificación',     createdAt: new Date(), updatedAt: new Date() },
    ]);
  },
  down: async (queryInterface) => queryInterface.bulkDelete('Attendances', null, {})
};