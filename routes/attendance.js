const router = require('express').Router();
const ctrl   = require('../controllers/attendanceController');

router.get('/',             ctrl.getAll);        // GET  /api/attendance
router.get('/date/:date',   ctrl.getByDate);     // GET  /api/attendance/date/2025-05-29
router.post('/',            ctrl.create);        // POST /api/attendance
router.put('/:id',          ctrl.update);        // PUT  /api/attendance/:id
router.delete('/:id',       ctrl.remove);        // DELETE /api/attendance/:id

module.exports = router;