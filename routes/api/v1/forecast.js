var express = require("express");
var router = express.Router();
var fetch = require('node-fetch');
var User = require('../../../models').User;
var Location = require('../../../models').Location;
require('dotenv').config();
pry = require('pryjs');


// GET forecast for a city
router.get('/', function(req, res, next){
  User.findOne({where: {api_key: req.body.api_key}})
  .then(user => {
    if (user === null) {
      res.setHeader("Content-Type", "application/json");
      res.status(401).send(JSON.stringify("Your API key is not valid"));
    }
    else {
      var loc = req.query.location
      getLocation(loc)
  	  .then(function(fetched_location){
        return getForecast(fetched_location, loc);
      })
      .then(function(fetched_forecast){
        delete fetched_forecast.minutely;
        res.status(200).send({
          location: loc,
          currently: fetched_forecast.currently,
          hourly: fetched_forecast.hourly,
          daily: fetched_forecast.daily
        });
      })
      .catch(error => {
        res.setHeader("Content-Type", "application/json");
        res.status(500).send({ error });
      })
	  }
  })
  .catch(error => {
    res.setHeader("Content-Type", "application/json");
    res.status(500).send({ error });
  })
});

function getLocation(location) {
  var url = `https://maps.googleapis.com/maps/api/geocode/json?address=${location}&key=${process.env.GEOCODING_API}`
  var fetched = fetch(url)
  .then(function(location_response){
    return location_response.json();
  })
  return fetched
};

function getForecast(fetched_location, loc){
  var lat = fetched_location.results[0].geometry.location.lat
  var long = fetched_location.results[0].geometry.location.lng
  var url = `https://api.darksky.net/forecast/${process.env.DARK_SKY_API}/${lat},${long}`
  Location.findOrCreate({
    where: { address: loc},
    defaults: { latitude: lat, longitude: long }
  })
  var fetched = fetch(url)
  .then(function(forecast_response){
    return forecast_response.json();
  })
  return fetched
};

	module.exports = router;
