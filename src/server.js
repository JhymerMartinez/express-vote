const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const createError = require('http-errors')
const cors = require('cors');
const db = require('./db');
const config = require('./config');
const app = express();

app.use(morgan('dev'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors())

if (config.ENV !== 'test') {
  db.connect();
}

require("./routes")(app);

app.use((req, res, next) => {
  return next(createError(404, 'Route not found'))
});

module.exports = app
