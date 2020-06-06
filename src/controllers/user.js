const createError = require('http-errors')
const { loginUser } = require('../services/auth')
module.exports = {
  async login(req, res, next) {
    const { username, password } = req.body;
    try {
      const {token, user} = await loginUser(username, password);

      return res.json({
        token,
        user
      });
    } catch (error) {
      return next(createError(400, error))
    }
  },
  createEmployee(req, res) {

  }
}
