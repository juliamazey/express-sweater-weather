var express = require("express");
var router = express.Router();
var fetch = require('node-fetch');
require('dotenv').config();
pry = require('pryjs');


// GET forecast for a city
router.get('/', function(req, res, next){
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
      
	    fetch(url)
	    .then(function(forecast_response){
	      return forecast_response.json();
	    })
	    .then(function(forecast_json){
	      res.status(200).send(forecast_json);
	    });
	  });
	});

	module.exports = router;
