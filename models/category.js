'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Restaurant extends Model {
    static associate (models) {
      Category.hasMany(models.Restaurant)
    }
  };
  Category.init({
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Category'
  })
  return Category
}
