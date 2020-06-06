const moment = require('moment');
const createError = require('http-errors');
const User = require('../models/user');
const Area = require('../models/area');
const config = require('../config');

module.exports = {

  async getEmployees(req, res, next) {
    const findOptions = {
      role: config.roles.EMPLOYEE
    }

    if (req.user.role === config.roles.EMPLOYEE) {
      findOptions._id = {
        $ne: req.user._id
      }
    }

    let employees = [];
    try {
      employees = await User.find(findOptions).select('-votes')
    .select('-password -salt');
    } catch (error) {
      return next(createError(400, error));
    }

    return res.json(employees);
  },

  async createEmployee(req, res, next) {
    const { body } = req;
    let newEmployee = null;
    try {
      newEmployee = await User.create({
        ...body,
        role: config.roles.EMPLOYEE
      });
    } catch (error) {
      return next(createError(400, error));
    }

    return res.json(newEmployee.toJSON());
  },

  async getAvailableEmployeesByArea(req, res, next) {
    const { area_id: areaId } = req.params || {};

    let area = null;

    try {
      area = await Area.findOne({
        _id: areaId
      });
    } catch (error) {
      return next(createError(400, error));
    }

    if (!area) {
      return next(createError(400, 'Area not found.'))
    }

    let user = null;

    try {
      user = await User.findOne({
        _id: req.user._id,
      }).populate({
        path: 'votes',
        select: 'employee',
        match: {
          area: area._id,
          createdAt: {
            $gte: moment().startOf('month').format('YYYY-MM-DD'),
            $lte: moment().endOf('month').format('YYYY-MM-DD')
          }
        }
      })
    } catch (error) {
      return next(createError(400, error));
    }

    let employees = [];

    try {
      const { votes = [] } = user || {};
      const employeeIds = votes.map(item => item.employee);
      employees = await User.find({
        _id: {
          $nin: [...employeeIds, req.user._id]
        },
        role: config.roles.EMPLOYEE
      })
      .select('-password -salt');
    } catch (error) {
      return next(createError(400, error));
    }

    return res.json(employees);
  }
}
