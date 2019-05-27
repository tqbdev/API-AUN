const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const log4js = require('log4js');
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const rfs = require('rotating-file-stream');

const { sequelize } = require('./models');
const config = require('./config/config');

const logStream = rfs('access.log', {
  interval: '30d', // rotate monthly
  path: path.join(__dirname, 'logs')
});

log4js.configure({
  appenders: {
    error: {
      type: 'file',
      filename: 'logs/error.log',
      maxLogSize: 10485760,
      backups: 3
    }
  },
  categories: { default: { appenders: ['error'], level: 'error' } }
});

require('./passport');
const app = express();

app.use(
  logger('dev', {
    skip: function(req, res) {
      return res.statusCode < 400;
    }
  })
);
app.use(logger('common', { stream: logStream }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(cors());
app.use('/storage', express.static(path.join(__dirname, 'storage')));
app.use(fileUpload());

require('./routes')(app);
app.use((err, req, res, next) => {
  switch (err.message) {
    case '404':
      return res.status(404).send();
    case '403':
      return res.status(403).send({
        error: 'You do not have access to this resource'
      });
    case '401':
      return res.status(401).send({
        error: 'Your authenticate information is incorrect.'
      });
    default:
      next(err);
  }
});

sequelize
  .sync({
    force: false
  })
  .then(() => {
    app.listen(config.PORT);
    console.log(`Server started on port ${config.PORT}`);
  });

module.exports = app;
