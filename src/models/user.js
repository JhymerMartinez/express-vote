const mongoose = require('mongoose');
const crypto = require('crypto');
const config = require('../config');

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: String,
  username: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: config.roles.EMPLOYEE
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  salt: String,
  votes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vote'
  }]
}, {
  timestamps: true
});

// Validate username is not taken
UserSchema
  .path('username')
  .validate(async function(value) {
    const user =  await this.constructor.findOne({ username: value });
    if(user) {
      const usernameExists = this.id === user.id;
      return usernameExists;
    }
    return true;
  }, 'The specified username is already in use.');

  UserSchema
  .virtual('profile')
  .get(function() {
    return {
      _id: this._id,
      id: this.id,
      username: this.username,
      firstName: this.firstName,
      lastName: this.lastName,
      role: this.role
    };
  });

  const validatePresenceOf = function (value) {
    return value && value.length;
  };

  UserSchema
    .pre('save', async function (next) {
      if(!this.isModified('password')) {
        return next();
      }

      if(!validatePresenceOf(this.password)) {
        return next();
      }

      try {
        const salt = await this.makeSalt();
        this.salt = salt;
      } catch (error) {
        return next(error);
      }

      try {
        const hashedPassword = await this.encryptPassword(this.password);
        this.password = hashedPassword;
        return next();
      } catch (error) {
        return next(error);
      }

    });

/**
 * Methods
 */
UserSchema.methods = {
  toJSON() {
    const obj = this.toObject();
    delete obj.password;
    delete obj.salt;
    return obj;
  },
  async authenticate(password) {
    try {
      const encryptedPassword = await this.encryptPassword(password);
      if(this.password === encryptedPassword) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error(error);
      return false;
    }
  },

  makeSalt(byteSize = 16) {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(byteSize, (err, salt) => {
        if(err) {
          reject(err);
        } else {
          resolve(salt.toString('base64'));
        }
      });
    });
  },

  encryptPassword(password) {
    return new Promise((resolve, reject) => {
      if(!password || !this.salt) {
        return reject('Missing password or salt');
      }
      const defaultIterations = 10000;
      const defaultKeyLength = 64;
      const salt = new Buffer(this.salt, 'base64');

      crypto.pbkdf2(password,
        salt,
        defaultIterations,
        defaultKeyLength,
        'sha1', (err, key) => {
          if(err) {
            reject(err);
          } else {
            resolve(key.toString('base64'));
          }
        });
    });

  }
};

module.exports = mongoose.model('User', UserSchema);
