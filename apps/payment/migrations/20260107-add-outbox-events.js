'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('subscriptions', 'outboxEvents', {
      type: Sequelize.JSON,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('subscriptions', 'outboxEvents');
  },
};
