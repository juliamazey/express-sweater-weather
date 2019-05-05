var express = require("express");
var router = express.Router();
var fetch = require('node-fetch');
var User = require('../../../models').User;
var Location = require('../../../models').Location;
var Favorite = require('../../../models').Favorite;
require('dotenv').config();
pry = require('pryjs');


// POST favorite for a user
router.post('/', function(req, res) {
  User.findOne({where: {api_key: req.body.api_key}})
  .then(function(user) {
    if (user === null) {
      sendInvalidResponse(res)
    }
    else {
      var loc = req.body.location
  	  var url = `https://maps.googleapis.com/maps/api/geocode/json?address=${loc}&key=${process.env.GEOCODING_API}`
      getLocation(loc)
  	  .then(function(fetched_location){
        return createLocation(fetched_location, loc);
      })
      .then( loc => {
        return addFavoriteResponse(loc, user, res)
      })
	  }
  })
  .catch(error => {
    sendErrorResponse(res, error);
  })
});

// GET favorites for a user
router.get('/', function(req, res) {
  User.findOne({where: {api_key: req.body.api_key}})
  .then(function(user) {
    if (user === null) {
      sendInvalidResponse(res)
    }
    else {
      return Location.findAll({
        include: { model: Favorite, where: { UserId: user.id} }
      })
      .then( favorites => {
        return getFavoritesForecast(favorites);
      })
      .then(favs => {
        res.setHeader("Content-Type", "application/json"),
        res.status(200).send(favs);
      })
      .catch(error => {
        sendErrorResponse(res, error);
      })
	  }
  })
  .catch(error => {
    sendErrorResponse(res, error);
  })
});

// DELETE favorite for a user
router.delete('/', function(req, res) {
  User.findOne({where: {api_key: req.body.api_key}})
  .then(function(user) {
    if (user === null) {
      sendInvalidResponse(res)
    }
    else {
      destroyLocation(req.body.location, res, user);
    }
  })
  .catch(error => {
    sendErrorResponse(res, error);
  })
});

function sendInvalidResponse(res) {
  res.setHeader("Content-Type", "application/json");
  res.status(401).send(JSON.stringify("Your API key is not valid"));
}

function sendErrorResponse(res, error) {
  res.setHeader("Content-Type", "application/json");
  res.status(500).send({ error });
}

function getLocation(location) {
  var url = `https://maps.googleapis.com/maps/api/geocode/json?address=${location}&key=${process.env.GEOCODING_API}`
  var fetched = fetch(url)
  .then(function(location_response){
    return location_response.json();
  })
  return fetched
};

function createLocation(fetched_location, loc){
  var lat = fetched_location.results[0].geometry.location.lat
  var long = fetched_location.results[0].geometry.location.lng
  var url = `https://api.darksky.net/forecast/${process.env.DARK_SKY_API}/${lat},${long}`
  var location = Location.findOrCreate({
    where: { address: loc},
    defaults: { latitude: lat, longitude: long }
  })
  return location
};

function addFavoriteResponse(loc, user, res) {
  return Favorite.findOrCreate({
    where: { LocationId: loc[0].id, UserId: user.id },
    defaults: { LocationId: loc[0].id, UserId: user.id}
  })
  .then( fav => {
    res.setHeader("Content-Type", "application/json");
    res.status(200).send(JSON.stringify({ message: `${loc[0].address} has been added to your favorites`}));
  })
  .catch(error => {
    sendErrorResponse(res, error);
  })
};

function getFavoritesForecast(favorites) {
  var favoritesWeather = favorites.map( function(fav) {
    lat = fav.latitude
    long = fav.longitude
    url = `https://api.darksky.net/forecast/${process.env.DARK_SKY_API}/${lat},${long}`
    var fetched = fetch(url)
    .then(function(forecast_response){
      return forecast_response.json();
    })
    .then( weather_data => {
      return { location: fav.address, current_weather: weather_data.currently }
    })
    .then(results => {
      return results
    })
    return fetched
  });
  return Promise.all(favoritesWeather)
};

function destroyLocation(loc, res, user) {
  Location.findOne({where: { address: loc }})
  .then(location => {
    Favorite.destroy({
      where: { UserId: user.id, LocationId: location.id}
    })
  })
  .then(fav => {
    res.setHeader("Content-Type", "application/json");
    res.status(204).send();
  })
  .catch(error => {
    sendErrorResponse(res, error);
  })
};

module.exports = router;
