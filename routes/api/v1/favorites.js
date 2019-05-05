var express = require("express");
var router = express.Router();
var fetch = require('node-fetch');
var User = require('../../../models').User;
var Location = require('../../../models').Location;
var Favorite = require('../../../models').Favorite;
require('dotenv').config();
pry = require('pryjs');


// POST favorite for a user
router.post('/', function(req, res, next) {
  User.findOne({
    where: {
      api_key: req.body.api_key
    }
  })
  .then(function(user) {
    if (user === null) {
      res.setHeader("Content-Type", "application/json");
      res.status(401).send(JSON.stringify("Your API key is not valid"));
    }
    else {
      var location = req.body.location
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
          defaults: {
            latitude: lat,
            longitude: long }
        })
        .then( loc => {
          return Favorite.findOrCreate({
            where: {
              LocationId: loc[0].id,
              UserId: user.id
            },
            defaults: {
              LocationId: loc[0].id,
              UserId: user.id
            }
          })
        })
        .then( fav => {
          res.setHeader("Content-Type", "application/json");
          res.status(200).send(JSON.stringify({
            message: `${location} has been added to your favorites`
          }));
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

// GET favorites for a user
router.get('/', function(req, res, next) {
  User.findOne({
    where: {
      api_key: req.body.api_key
    }
  })
  .then(function(user) {
    if (user === null) {
      res.setHeader("Content-Type", "application/json");
      res.status(401).send(JSON.stringify("Your API key is not valid"));
    }
    else {
      return Location.findAll({
        include: {
          model: Favorite,
          where: { UserId: user.id}
        },
      })
      .then( favorites => {
        var favoritesWeather = favorites.map( function(fav) {
          lat = fav.latitude
          long = fav.longitude
    	    url = `https://api.darksky.net/forecast/${process.env.DARK_SKY_API}/${lat},${long}`
          var fetched = fetch(url)
          .then(function(forecast_response){
            return forecast_response.json();
          })
          .then( weather_data => {
            return {
              location: fav.address,
              current_weather: weather_data.currently
            }
          })
          .then(results => {
            return results
          })
          return fetched
        });
        return Promise.all(favoritesWeather)
      })
      .then(favs => {
        res.setHeader("Content-Type", "application/json"),
        res.status(200).send(favs);
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

// DELETE favorite for a user
router.delete('/', function(req, res, next) {
  User.findOne({
    where: {
      api_key: req.body.api_key
    }
  })
  .then(function(user) {
    if (user === null) {
      res.setHeader("Content-Type", "application/json");
      res.status(401).send(JSON.stringify("Your API key is not valid"));
    }
    else {
      Location.findOne({where: { address: req.body.location }})
      .then(location => {
        Favorite.destroy({
          where: {
            UserId: user.id,
            LocationId: location.id
          }
        })
      })
      .then(fav => {
        res.setHeader("Content-Type", "application/json");
        res.status(204).send();
      })
      .catch(error => {
        res.setHeader("Content-Type", "application/json");
        res.status(500).send({ error })
      });
    }
  })
  .catch(error => {
    res.setHeader("Content-Type", "application/json");
    res.status(500).send({ error });
  })
});

	module.exports = router;
