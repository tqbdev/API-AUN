const jwt = require('jsonwebtoken');
const randtoken = require('rand-token');
const _ = require('lodash');

const { User } = require('../models');
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
      const user = await User.create(req.body);

      await user.update({
        refreshToken
      });
      const userJson = user.toJSON();
      delete userJson['refreshToken'];

      res.send({
        user: userJson,
        token: jwtSignUser(userJson),
        refreshToken
      });
    } catch (err) {
      res.status(400).send({
        error: 'This email is already in use.'
      });
    }
  },

  async userSignIn(req, res) {
    try {
      const { email, password } = req.body;
      const user = await User.findByPk(email);

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
      await user.update({
        refreshToken,
        coordinate: null,
        ready: false
      });

      const userJson = user.toJSON();
      delete userJson['refreshToken'];

      res.send({
        user: userJson,
        token: jwtSignUser(userJson),
        refreshToken
      });
    } catch (err) {
      res.status(500).send({
        error: 'An error has occured trying to login'
      });
    }
  },

  async userToken(req, res) {
    try {
      const { email, refreshToken } = req.body;
      const user = await User.findOne({
        where: {
          email,
          refreshToken
        }
      });

      if (!user) {
        return res.status(401).send({
          error: 'The information was incorrect'
        });
      }

      const userJson = user.toJSON();
      delete userJson['refreshToken'];

      res.send({
        user: userJson,
        token: jwtSignUser(userJson)
      });
    } catch (err) {
      res.status(500).send({
        error: 'An error has occured trying to login'
      });
    }
  },

  async userRevokeToken(req, res) {
    try {
      const { email, refreshToken } = req.body;
      const user = await User.findOne({
        where: {
          email,
          refreshToken
        }
      });

      if (!user) {
        return res.status(401).send({
          error: 'The information was incorrect'
        });
      }

      await user.update({
        refreshToken: null
      });

      res.send({
        msg: 'Revoke token successfully'
      });
    } catch (err) {
      res.status(500).send({
        error: 'An error has occured trying to revoke token'
      });
    }
  }
};
