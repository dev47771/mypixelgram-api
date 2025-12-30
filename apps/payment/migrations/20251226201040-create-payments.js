'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('payments', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },

      userId: {
        type: Sequelize.UUID,
        allowNull: false,
      },

      subscriptionId: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'subscriptions',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },

      provider: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      amountCents: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      currency: {
        type: Sequelize.STRING(3),
        allowNull: false,
      },

      status: {
        type: Sequelize.ENUM(
          'pending',
          'succeeded',
          'failed'
        ),
        allowNull: false,
      },

      stripePaymentIntentId: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      },

      stripeInvoiceId: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('payments', ['userId'], {
      name: 'idx_payments_user',
    });

    await queryInterface.addIndex('payments', ['subscriptionId'], {
      name: 'idx_payments_subscription',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('payments');
  },
};
