const router = require('express').Router();

router.use('/employees', require('./employees'));
router.use('/attendance', require('./attendance'));
router.use('/payroll', require('./payroll'));
router.use('/payslips', require('./payslips'));

// router.get('/health', (_, res) => res.send('OK'));

module.exports = router;
