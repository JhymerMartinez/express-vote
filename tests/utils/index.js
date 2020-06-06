const app = require('../../src/server') // Link to your server file
const request = require('supertest');

const utils = {
  sendRequest({
    method = 'get',
    url = '/',
    data = {},
    token
  }) {
    return new Promise((resolve, reject) => {
      if (token) {
        request(app)[method](url)
          .set('Content-Type', 'application/json')
          .set('Authorization', `Bearer ${token}`)
          .send(data)
          .end((err, res) => {
            if (err) return reject(err);
            resolve(res);
          });
      } else {
        request(app)[method](url)
          .set('Content-Type', 'application/json')
          .send(data)
          .end((err, res) => {
            if (err) return reject(err);
            resolve(res);
          });
      }
    });
  },

  async loginUser(username, password, done) {
    return await utils.sendRequest({
      url: '/users/login',
      method: 'post',
      data: {
        username,
        password
      }
    }, done);
  }
}

module.exports = utils;
