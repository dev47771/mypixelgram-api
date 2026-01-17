import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Transaction } from 'sequelize';
import { PaymentModel, PaymentStatus } from '../../models/payment.model';
import { SubscriptionModel } from '../../models/subscription.model';

@Injectable()
export class PaymentRepo {
  constructor(
    @InjectModel(PaymentModel)
    private readonly paymentModel: typeof PaymentModel,
  ) {}

  async create(data: any, tx: Transaction) {
    return this.paymentModel.create(data, { transaction: tx });
  }

  async attachStripeIntent(paymentId: number, stripePaymentIntentId: string, tx: Transaction) {
    await this.paymentModel.update({ stripePaymentIntentId }, { where: { id: paymentId }, transaction: tx });
  }

  async updateStatus(paymentId: number, status: PaymentStatus, tx: Transaction) {
    await this.paymentModel.update({ status }, { where: { id: paymentId }, transaction: tx });
  }

  async findById(id: number, tx?: Transaction) {
    return this.paymentModel.findByPk(id, {
      transaction: tx,
      include: [
        {
          model: SubscriptionModel,
          as: 'subscription',
          required: true,
        },
      ],
    });
  }

  async findByUserIdWithSubscription(userId: string, limit: number, offset: number) {
    const payments = await this.paymentModel.findAll({
      where: {
        userId,
        status: PaymentStatus.SUCCEEDED,
      },
      include: [
        {
          model: SubscriptionModel,
          as: 'subscription',
          attributes: ['planName', 'expiresAt'],
          required: false,
        },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    return payments.map((payment) => ({
      id: payment.id.toString(),
      paymentDate: payment.createdAt.toISOString().split('T')[0],
      amount: `$${(payment.amountCents / 100).toFixed(2)}`,
      endDate: payment.subscription?.expiresAt ? payment.subscription.expiresAt.toISOString().split('T')[0] : 'N/A',
      subscriptionType: payment.subscription?.planName || 'One-time',
      paymentType: payment.provider === 'stripe' ? 'Stripe' : 'PayPal',
    }));
  }

  async countByUserId(userId: string) {
    return this.paymentModel.count({
      where: {
        userId,
        status: PaymentStatus.SUCCEEDED,
      },
    });
  }
}
