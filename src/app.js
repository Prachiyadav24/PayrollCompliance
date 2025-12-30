const express = require('express');
const session = require('express-session');
const cors = require('cors');

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: 'http://localhost:8000',
    credentials: true
  })
);

app.use(
  session({
    name: 'payroll.sid',
    secret: 'replace-with-env-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax'
    }
  })
);

app.use('/api', require('./routes'));

module.exports = app;
