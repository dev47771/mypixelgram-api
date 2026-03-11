import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, AllowNull, HasMany } from 'sequelize-typescript';
import { PaymentModel } from './payment.model';

export enum SubscriptionStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELED = 'canceled',
  REPLACED = 'replaced',
}

@Table({ tableName: 'subscriptions', timestamps: true })
export class SubscriptionModel extends Model<SubscriptionModel> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  declare id: number;

  @AllowNull(false)
  @Column(DataType.UUID)
  declare userId: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  declare planId: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  declare planName: string;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare priceCents: number;

  @AllowNull(false)
  @Column(DataType.ENUM(...Object.values(SubscriptionStatus)))
  declare status: SubscriptionStatus;

  @AllowNull(true)
  @Column(DataType.STRING)
  declare stripeSubscriptionId?: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  declare stripeCustomerId?: string;

  @AllowNull(true)
  @Column(DataType.DATE)
  declare startedAt?: Date;

  @AllowNull(true)
  @Column(DataType.DATE)
  declare expiresAt?: Date;

  @HasMany(() => PaymentModel)
  declare payments?: PaymentModel[];

  @AllowNull(true)
  @Column(DataType.JSON)
  declare outboxEvents?: Array<{
    type: string;
    payload: any;
    createdAt: Date;
  }>;
}
