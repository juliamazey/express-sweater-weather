var express = require("express");
var router = express.Router();
var User = require('../../../models').User;
const bcrypt = require('bcrypt');


/*POST new session*/
router.post('/', function(req, res, next) {
  User.findOne({
    where: {
      email: req.body.email
    }
  })
  .then(user => {
    bcrypt.compare(req.body.password, user.password, function(err, response) {
      if (response) {
        res.setHeader("Content-Type", "application/json");
        res.status(200).send(JSON.stringify({
          api_key: user.api_key
        }));
      }
      else {
        res.setHeader("Content-Type", "application/json");
        res.status(401).send(JSON.stringify({
          error: "Something went wrong"
        }));
      }
    })
  })
  .catch(error => {
    res.setHeader("Content-Type", "application/json");
    res.status(500).send({ error });
  })
});

module.exports = router;
