var express = require('express');
var router = express.Router();
// var db = require('../models');
// var bcrypt = require('bcrypt');
// const saltRounds = 10;

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
