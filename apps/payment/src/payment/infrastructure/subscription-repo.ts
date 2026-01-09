import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Transaction } from 'sequelize';
import { SubscriptionModel, SubscriptionStatus } from '../../models/subscription.model';

@Injectable()
export class SubscriptionRepo {
  constructor(
    @InjectModel(SubscriptionModel)
    private readonly subscriptionModel: typeof SubscriptionModel,
  ) {}

  async replaceActive(userId: string, tx: Transaction) {
    await this.subscriptionModel.update(
      { status: SubscriptionStatus.REPLACED },
      {
        where: {
          userId,
          status: SubscriptionStatus.ACTIVE,
        },
        transaction: tx,
      },
    );
  }

  async create(data: Partial<SubscriptionModel>, tx: Transaction) {
    return this.subscriptionModel.create(data as any, {
      transaction: tx,
    });
  }

  async activateById(subscriptionId: number, tx: Transaction, planDays: number) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + planDays);
    await this.subscriptionModel.update(
      {
        status: SubscriptionStatus.ACTIVE,
        startedAt: new Date(),
        expiresAt,
      },
      {
        where: { id: subscriptionId },
        transaction: tx,
      },
    );
  }

  async addOutboxEvent(subscriptionId: number, eventType: string, payload: any, tx?: Transaction) {
    const subscription = await this.subscriptionModel.findByPk(subscriptionId, {
      transaction: tx,
    });

    if (!subscription) return;

    const events = subscription.outboxEvents || [];
    events.push({
      type: eventType,
      payload,
      createdAt: new Date(),
    });

    await subscription.update({ outboxEvents: events }, { transaction: tx });
  }
}
