const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');

const { sequelize } = require('./models');
const config = require('./config/config');

require('./passport');
const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(cors());
app.use('/storage', express.static(path.join(__dirname, 'storage')));
app.use(fileUpload());

require('./routes')(app);

sequelize
  .sync({
    force: false
  })
  .then(() => {
    app.listen(config.PORT);
    console.log(`Server started on port ${config.PORT}`);
  });

module.exports = app;
