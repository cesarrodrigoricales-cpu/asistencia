const express = require('express');
const cors    = require('cors');
require('dotenv').config();
const { sequelize } = require('./models');

const attendanceRoutes = require('./routes/attendance');
const studentRoutes    = require('./routes/students');
const courseRoutes     = require('./routes/courses');
const errorHandler     = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));  

// Rutas
app.use('/api/attendance', attendanceRoutes);
app.use('/api/students',   studentRoutes);
app.use('/api/courses',    courseRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Manejador de errores (siempre al final)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

sequelize.authenticate()
  .then(() => {
    console.log('✅ Base de datos conectada');
    app.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`));
  })
  .catch(err => {
    console.error('❌ Error de conexión a DB:', err);
    process.exit(1);
  });