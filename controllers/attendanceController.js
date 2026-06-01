const { Attendance, Student } = require('../models');

const getAll = async (req, res) => {
  try {
    const attendances = await Attendance.findAll({
      include: [{ model: Student, attributes: ['name', 'level'] }]
    });
    res.json(attendances);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getByDate = async (req, res) => {
  try {
    const attendances = await Attendance.findAll({
      where: { date: req.params.date }
    });
    res.json(attendances);
  } catch (err) {
    console.log('ERROR GETBYDATE:', err.message);
    res.status(500).json({ error: err.message });
  }
};

const create = async (req, res) => {
  try {
    const attendance = await Attendance.create(req.body);
    res.status(201).json(attendance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const update = async (req, res) => {
  try {
    const attendance = await Attendance.findByPk(req.params.id);
    if (!attendance) return res.status(404).json({ error: 'No encontrado' });
    await attendance.update(req.body);
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const attendance = await Attendance.findByPk(req.params.id);
    if (!attendance) return res.status(404).json({ error: 'No encontrado' });
    await attendance.destroy();
    res.json({ message: 'Eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



module.exports = { getAll, getByDate, create, update, remove };