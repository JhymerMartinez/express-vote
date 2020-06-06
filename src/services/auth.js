const User = require('../models/user')
const config = require('../config');
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');
const compose = require('composable-middleware');
const createError = require('http-errors')

const validateJwt = expressJwt({
  secret: config.secrets.SESSION
});

const auth = {
  async loginUser(username, password) {
    let user = null;
    try {
      user = await User.findOne({ username });
    } catch (error) {
      throw new Error(error);
    }

    if (!user) {
      throw new Error('Not user with that username.');
    }

    const passwordIsValid = user.authenticate(password);
    if (!passwordIsValid) {
      throw new Error('Invalid username or password.');
    }

    const token = auth.buildSessionToken(user);
    return { token, user: user.profile };
  },

  buildSessionToken (user) {
    let expiresIn = '90d';
    if (user.role === config.roles.ADMIN) {
      expiresIn = '7d';
    }

    const token = jwt.sign({ _id: user._id, role: user.role }, config.secrets.SESSION, {
      expiresIn
    });

    return token;
  },

  validateToken(req, res, next) {
    // allow access_token to be passed through query parameter as well
    if(req.query && req.query.hasOwnProperty('access_token')) {
      req.headers.authorization = `Bearer ${req.query.access_token}`;
    }
    // IE11 forgets to set Authorization header sometimes. Pull from cookie instead.
    if(req.query && typeof req.headers.authorization === 'undefined') {
      req.headers.authorization = `Bearer ${req.cookies.token}`;
    }

    validateJwt(req, res, next);
  },

  appendUserToRequest (req, res, next) {
    User.findById(req.user._id).exec()
      .then(user => {
        if(!user) {
          return next(createError(401, 'Unauthorized'))
        }
        req.user = user;
        next();
      })
      .catch(err => next(err));
  },

  isAuthenticated(authorizedRoles = []) {
    return compose()
      .use(auth.validateToken)
      .use(auth.appendUserToRequest)
      .use((req, res, next) => {
        const { role } = req.user;
        const roleExists = authorizedRoles.includes(role);
        if (roleExists) {
          next();
        } else {
          return next(createError(401, 'Unauthorized'))
        }

      });
  }
}

module.exports = auth;
