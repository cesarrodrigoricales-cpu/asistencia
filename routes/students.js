const router = require('express').Router();
const ctrl   = require('../controllers/studentController');

router.get('/',              ctrl.getAll);        // GET  /api/students
router.get('/:id',           ctrl.getById);       // GET  /api/students/1
router.get('/course/:courseId', ctrl.getByCourse);// GET  /api/students/course/1
router.post('/',             ctrl.create);        // POST /api/students
router.put('/:id',           ctrl.update);        // PUT  /api/students/1
router.delete('/:id',        ctrl.remove);        // DELETE /api/students/1

module.exports = router;