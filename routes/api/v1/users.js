var express = require("express");
var router = express.Router();
var User = require('../../../models').User;
var bcrypt = require('bcrypt');
const saltRounds = 10;
const uuidv4 = require('uuid/v4');

/*POST new user*/
router.post('/', function(req, res, next) {
  if (req.body.password && req.body.password_confirmation && req.body.email) {
    if (req.body.password === req.body.password_confirmation) {
      bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
        User.create({
            email: req.body.email,
            password: hash,
            api_key: uuidv4()
          })
          .then(user => {
            res.setHeader("Content-Type", "application/json");
            res.status(201).send(JSON.stringify({
              api_key: user.api_key
            }));
          })
          .catch(error => {
            res.setHeader("Content-Type", "application/json");
            res.status(500).send({ error });
          })
      });
    }
    else {
      res.setHeader("Content-Type", "application/json");
      res.status(401).send(JSON.stringify({
        error: "Your passwords don't match"
    }))
    }
  }
  else {
    res.setHeader("Content-Type", "application/json");
    res.status(401).send(JSON.stringify({
      error: "You are missing information"
  }))
  }
});

module.exports = router;
