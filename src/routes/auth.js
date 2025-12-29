const router = require('express').Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');

// login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email } });
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  req.session.userId = user.id;
  req.session.role = user.role;

  res.json({
    message: 'Logged in',
    role: user.role
  });
});

// logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('payroll.sid');
    res.json({ message: 'Logged out' });
  });
});

// who am i
router.get('/me', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  res.json({
    userId: req.session.userId,
    role: req.session.role
  });
});

module.exports = router;
