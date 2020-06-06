const express = require('express');
const { isAuthenticated } = require('../services/auth');
const { area } = require('../controllers');
const config = require('../config');
const router = express.Router();

router
    .route('/')
    .get(isAuthenticated([config.roles.EMPLOYEE, config.roles.ADMIN]), area.getAreas)

module.exports = router;
