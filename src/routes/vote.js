const express = require('express');
const { vote } = require('../controllers');
const config = require('../config');
const { isAuthenticated } = require('../services/auth');
const router = express.Router();

router
    .route('/')
    .post(isAuthenticated([config.roles.EMPLOYEE]), vote.addVote)

router
    .route('/current')
    .get(isAuthenticated([config.roles.EMPLOYEE]), vote.getCurrentVotes)

router
    .route('/areas/:area_id')
    .get(isAuthenticated([config.roles.ADMIN]), vote.getVotesByArea)

router
    .route('/date/:year/:month')
    .get(isAuthenticated([config.roles.ADMIN]), vote.getVotesByMonth)

module.exports = router;
