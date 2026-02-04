'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('subscriptions', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },

      userId: {
        type: Sequelize.UUID,
        allowNull: false,
      },

      planId: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      planName: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      priceCents: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      status: {
        type: Sequelize.ENUM(
          'pending',
          'active',
          'expired',
          'canceled',
          'replaced'
        ),
        allowNull: false,
      },

      stripeSubscriptionId: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      },

      stripeCustomerId: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      startedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      expiresAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal(
          'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
        ),
      },
    });

    await queryInterface.addIndex('subscriptions', ['userId'], {
      name: 'idx_subscriptions_user',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('subscriptions');
  },
};
