const { Student, Course } = require('../models');

const getAll = async (req, res) => {
  try {
    const students = await Student.findAll({
      include: [{ model: Course, attributes: ['name', 'teacher'] }]
    });
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getById = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id, {
      include: [{ model: Course, attributes: ['name', 'teacher'] }]
    });
    if (!student) return res.status(404).json({ error: 'No encontrado' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getByCourse = async (req, res) => {
  try {
    const students = await Student.findAll({
      where:   { courseId: req.params.courseId },
      include: [{ model: Course, attributes: ['name', 'teacher'] }]
    });
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const create = async (req, res) => {
  try {
    const student = await Student.create(req.body);
    res.status(201).json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const update = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) return res.status(404).json({ error: 'No encontrado' });
    await student.update(req.body);
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) return res.status(404).json({ error: 'No encontrado' });
    await student.destroy();
    res.json({ message: 'Eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getAll, getById, getByCourse, create, update, remove };