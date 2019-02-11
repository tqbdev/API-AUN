const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');

const { sequelize } = require('./models');
const config = require('./config/config');

// const indexRouter = require('./routes/index');
// const usersRouter = require('./routes/users');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'storage')));

// app.use('/', indexRouter);
// app.use('/users', usersRouter);

sequelize
  .sync({
    force: false
  })
  .then(() => {
    app.listen(config.PORT);
    console.log(`Server started on port ${config.PORT}`);
  });

module.exports = app;
