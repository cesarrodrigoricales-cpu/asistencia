const router = require('express').Router();
const ctrl   = require('../controllers/courseController');

router.get('/',     ctrl.getAll);   // GET  /api/courses
router.get('/:id',  ctrl.getById);  // GET  /api/courses/1
router.post('/',    ctrl.create);   // POST /api/courses
router.put('/:id',  ctrl.update);   // PUT  /api/courses/1
router.delete('/:id', ctrl.remove); // DELETE /api/courses/1

module.exports = router;