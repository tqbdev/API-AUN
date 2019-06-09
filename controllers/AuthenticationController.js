const jwt = require('jsonwebtoken');
const randtoken = require('rand-token');
const _ = require('lodash');
const moment = require('moment');
const logger = require('log4js').getLogger('error');

const { AUN_USER, AUN_REFRESH_TOKEN } = require('../models');
const config = require('../config/config');

function jwtSignUser(user) {
  return jwt.sign(
    {
      user
    },
    config.authencation.jwtSecret,
    {
      expiresIn: config.authencation.jwtExpiresIn
    }
  );
}

module.exports = {
  async userSignUp(req, res) {
    try {
      const refreshToken = randtoken.uid(256);
      const user = await AUN_USER.create(req.body);
      const refresh = await AUN_REFRESH_TOKEN.create({
        refreshToken: refreshToken,
        expiredAt: moment()
          .add(1, 'year')
          .toDate(),
        UserEmail: user.email
      });

      const userJson = user.toJSON();

      res.send({
        user: userJson,
        token: jwtSignUser(userJson),
        refreshToken
      });
    } catch (err) {
      logger.error(err);
      res.status(400).send({
        error: 'This email is already in use.'
      });
    }
  },

  async userSignIn(req, res) {
    try {
      const { email, password } = req.body;
      const user = await AUN_USER.findByPk(email);

      if (!user) {
        return res.status(403).send({
          error: 'The login information was incorrect'
        });
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(403).send({
          error: 'The login information was incorrect'
        });
      }

      const refreshToken = randtoken.uid(256);
      await AUN_REFRESH_TOKEN.create({
        refreshToken: refreshToken,
        expiredAt: moment()
          .add(1, 'year')
          .toDate(),
        UserEmail: user.email
      });

      const userJson = _.pick(user.toJSON(), [
        'email',
        'name',
        'phone',
        'isAdmin',
        'createdAt',
        'updatedAt'
      ]);

      res.send({
        user: userJson,
        token: jwtSignUser(userJson),
        refreshToken
      });
    } catch (err) {
      logger.error(err);
      res.status(500).send({
        error: 'An error has occured trying to login'
      });
    }
  },

  async userToken(req, res) {
    try {
      const { email, refreshToken } = req.body;
      const refresh = await AUN_REFRESH_TOKEN.findOne({
        where: {
          UserEmail: email,
          refreshToken: refreshToken,
          isRevoke: false
        }
      });

      if (!refresh) {
        return res.status(401).send({
          error: 'The information was incorrect'
        });
      }

      const now = moment();
      const expiredAt = moment(refresh.expiredAt);
      if (expiredAt.diff(now) <= 0) {
        return res.status(403).send({
          error: 'Your refresh token is expired'
        });
      }

      const user = await refresh.getUser();

      const userJson = user.toJSON();

      res.send({
        user: userJson,
        token: jwtSignUser(userJson)
      });
    } catch (err) {
      logger.error(err);
      res.status(500).send({
        error: 'An error has occured trying to login'
      });
    }
  },

  async userRevokeToken(req, res) {
    try {
      const { email, refreshToken } = req.body;
      const refresh = await AUN_REFRESH_TOKEN.findOne({
        where: {
          UserEmail: email,
          refreshToken: refreshToken
        }
      });

      if (!refresh) {
        return res.status(401).send({
          error: 'The information was incorrect'
        });
      }

      await refresh.update({
        isRevoke: true
      });

      res.send({
        msg: 'Revoke token successfully'
      });
    } catch (err) {
      logger.error(err);
      res.status(500).send({
        error: 'An error has occured trying to revoke token'
      });
    }
  },

  async changePassword(req, res) {
    try {
      const { oldPassword, newPassword } = req.body;
      const user = req.user;

      let userDB = await AUN_USER.findByPk(user.email);

      if (!userDB) {
        return res.status(403).send({
          error: 'The login information was incorrect'
        });
      }

      const isPasswordValid = await userDB.comparePassword(oldPassword);
      if (!isPasswordValid) {
        return res.status(403).send({
          error: 'The login information was incorrect'
        });
      }

      await userDB.update({
        password: newPassword
      });

      userDB = await AUN_USER.findByPk(user.email);

      const userJson = _.pick(userDB.toJSON(), [
        'email',
        'name',
        'phone',
        'isAdmin',
        'createdAt',
        'updatedAt'
      ]);

      res.send(userJson);
    } catch (err) {
      logger.error(err);
      res.status(500).send({
        error: 'An error has occured trying to change password'
      });
    }
  }
};
