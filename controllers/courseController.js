const { Course, Student } = require('../models');

const getAll = async (req, res) => {
  try {
    const where = req.query.level ? { level: req.query.level } : {};
    const courses = await Course.findAll({ where });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getById = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id, {
      include: [{ model: Student, attributes: ['name', 'level'] }]
    });
    if (!course) return res.status(404).json({ error: 'No encontrado' });
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const create = async (req, res) => {
  try {
    const course = await Course.create(req.body);
    res.status(201).json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const update = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ error: 'No encontrado' });
    await course.update(req.body);
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ error: 'No encontrado' });
    await course.destroy();
    res.json({ message: 'Eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getAll, getById, create, update, remove };