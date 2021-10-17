'use strict'
const faker = require('faker')
const db = require('../models')
const User = db.User
const Restaurant = db.Restaurant

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const totalUserId = await User.findAll({attributes:['id'], raw: true, nest: true})
    const totalRestaurantId = await Restaurant.findAll({attributes:['id'], raw: true, nest: true})
    await queryInterface.bulkInsert('Comments',
      totalRestaurantId.map((item) =>
        ({
          text: faker.lorem.sentence(3),
          UserId: totalUserId[Math.floor(Math.random() * totalUserId.length)].id,
          RestaurantId: totalRestaurantId[Math.floor(Math.random() * totalRestaurantId.length)].id,
          createdAt: new Date(),
          updatedAt: new Date() 
        })
      ), {})
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Comments', null, {})
  }
};
