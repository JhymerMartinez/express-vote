const express = require("express");
const { root } = require('../controllers');
const router = express.Router();

router
    .route('/')
    .get(root.sayHello)
module.exports = router;
