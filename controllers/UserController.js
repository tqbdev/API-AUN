const _ = require('lodash');
const logger = require('log4js').getLogger('error');

const { AUN_USER } = require('../models');

module.exports = {
  async readAll(req, res) {
    try {
      const users = await AUN_USER.findAll({
        where: {
          isAdmin: false
        }
      });
      res.send(users);
    } catch (err) {
      logger.logger(err);
      res.status(500).send({
        error: 'Error in get users.'
      });
    }
  },

  async readOne(req, res) {
    try {
      const { id } = req.params;

      const user = await AUN_USER.findOne({
        where: {
          id: id,
          isAdmin: false
        }
      });

      if (!user) {
        return res.status(404).send({
          error: 'Not found the user has id ' + id
        });
      }

      res.send(user.toJSON());
    } catch (err) {
      logger.logger(err);
      res.status(500).send({
        error: 'Error in get a user'
      });
    }
  },

  async create(req, res) {
    try {
      const user = await AUN_USER.create(req.body);

      res.send(user.toJSON());
    } catch (err) {
      switch (err.name) {
        case 'SequelizeUniqueConstraintError':
          return res.status(400).send({
            error: `Can't create a new user. Because existing!!!`
          });
        default:
          logger.logger(err);
          res.status(500).send({
            error: 'Error in create a user'
          });
      }
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const { attributes } = req.body;

      const user = await AUN_USER.findOne({
        where: {
          id: id
        }
      });

      if (!user) {
        return res.status(404).send({
          error: 'Not found the user has id ' + id
        });
      }

      if (
        attributes.name === undefined &&
        attributes.phone === undefined &&
        attributes.password === undefined
      ) {
        return res.status(406).send({
          error:
            'Not accepted. Required an attribute "name" or "phone" or "password"'
        });
      }

      const name = attributes.name;
      const phone = attributes.phone;
      const password = attributes.password;
      delete attributes.name;
      delete attributes.phone;
      delete attributes.password;
      if (!_.isEmpty(attributes)) {
        return res.status(406).send({
          error:
            'Not accepted. Only updatable for "name", "phone" and "password"'
        });
      }

      if (name) {
        await user.update({ name });
      }

      if (phone) {
        await user.update({ phone });
      }

      if (password) {
        await user.update({ password });
      }

      let userJSON = user.toJSON();
      delete userJSON.refreshToken;

      res.send(userJSON);
    } catch (err) {
      switch (err.name) {
        case 'SequelizeUniqueConstraintError':
          return res.status(400).send({
            error: `Can't update user. Because existing!!!`
          });
        default:
          logger.logger(err);
          res.status(500).send({
            error: 'Error in update user'
          });
      }
    }
  },

  async remove(req, res) {
    try {
      const { id } = req.params;

      const user = await AUN_USER.findOne({
        where: {
          id: id
        }
      });

      if (!user) {
        return res.status(404).send({
          error: 'Not found the user has id ' + id
        });
      }
      await user.destroy();

      res.send({});
    } catch (err) {
      logger.logger(err);
      res.status(500).send({
        error: 'Error in delete a user'
      });
    }
  }
};
