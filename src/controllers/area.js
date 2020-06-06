const createError = require('http-errors');
const Area = require('../models/area');

module.exports = {
  async getAreas(req, res, next) {
    let areas = [];
    try {
      areas = await Area.find({});
    } catch (error) {
      return next(createError(400, error));
    }
    res.json(areas);
  },
}
