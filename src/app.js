const express = require('express');
const session = require('express-session');

const app = express();
app.use(express.json());

app.use(
  session({
    name: 'payroll.sid',
    secret: 'replace-this-with-env-secret',
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
