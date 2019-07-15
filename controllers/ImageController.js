const _ = require('lodash');
const path = require('path');
const md5 = require('md5');
const logger = require('log4js').getLogger('error');

module.exports = {
  async uploadImage(req, res) {
    try {
      const file = _.get(req, 'files.upload');

      if (!file) {
        return res.status(400).send({
          error: 'No files were uploaded.'
        });
      }

      const originName = _.get(file, 'name');
      const totalSeconds = Math.floor(new Date().getTime() / 1000);
      const hashName =
        md5(originName + totalSeconds) + path.extname(originName);
      const appPath = path.normalize(__dirname + '/..');
      const uploadPath = appPath + '/storage/' + hashName;
      await file.mv(uploadPath);
      const linkFile = '/storage/' + hashName;

      res.send({
        url: linkFile
      });
    } catch (err) {
      logger.error(err);
      res.status(500).send({
        error: 'Error in upload image'
      });
    }
  }
};
