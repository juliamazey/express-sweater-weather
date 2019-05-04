var express = require("express");
var router = express.Router();
var fetch = require('node-fetch');
var User = require('../../../models').User;
var Location = require('../../../models').Location;
require('dotenv').config();
pry = require('pryjs');


// GET forecast for a city
router.get('/', function(req, res, next){
  User.findOne({
    where: {
      api_key: req.body.api_key
    }
  })
  .then(user => {
    if (user === null) {
      res.setHeader("Content-Type", "application/json");
      res.status(401).send(JSON.stringify("Your API key is not valid"));
    }
    else {
      var location = req.query.location
  	  var url = `https://maps.googleapis.com/maps/api/geocode/json?address=${location}&key=${process.env.GEOCODING_API}`
  	  fetch(url)
  	  .then(function(location_response){
  	    return location_response.json();
  	  })
  	  .then(function(location_json){
  	    var lat = location_json.results[0].geometry.location.lat
        var long = location_json.results[0].geometry.location.lng
  	    var url = `https://api.darksky.net/forecast/${process.env.DARK_SKY_API}/${lat},${long}`
        Location.findOrCreate({
          where: { address: location},
          defaults: { latitude: lat,
                      longitude: long }
        })
  	    fetch(url)
  	    .then(function(forecast_response){
  	      return forecast_response.json();
  	    })
  	    .then(function(forecast_json){
          delete forecast_json.minutely;
  	      res.status(200).send(forecast_json);
  	    })
        .catch(error => {
          res.setHeader("Content-Type", "application/json");
          res.status(500).send({ error });
        })
      });
	  }
  })
  .catch(error => {
    res.setHeader("Content-Type", "application/json");
    res.status(500).send({ error });
  })
});

	module.exports = router;
