'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn( 'Clients', 'RestaurantId', {
      type: Sequelize.INTEGER
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn( 'Clients', 'RestaurantId' );
  }
};
