const express = require('express');
const { isAuthenticated } = require('../services/auth');
const { employee } = require('../controllers');
const config = require('../config');
const router = express.Router();

router
    .route('/')
    .get(isAuthenticated([config.roles.ADMIN, config.roles.EMPLOYEE]), employee.getEmployees)
    .post(isAuthenticated([config.roles.ADMIN]), employee.createEmployee)

router
    .route('/areas/:area_id')
    .get(isAuthenticated([config.roles.EMPLOYEE]), employee.getAvailableEmployeesByArea)

module.exports = router;
