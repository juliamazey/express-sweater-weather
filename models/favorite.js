'use strict';
module.exports = (sequelize, DataTypes) => {
  const Favorite = sequelize.define('Favorite', {
    userId: DataTypes.INTEGER,
    locationId: DataTypes.INTEGER
  }, {});
  Favorite.associate = function(models) {
    Favorite.belongsTo(models.User)
    Favorite.belongsTo(models.Location)
  };
  return Favorite;
};
