import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, AllowNull, HasMany } from 'sequelize-typescript';
import { PaymentModel } from './payment.model';

export enum SubscriptionStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELED = 'canceled',
  REPLACED = 'replaced',
}

@Table({
  tableName: 'subscriptions',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
})
export class SubscriptionModel extends Model<SubscriptionModel> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  declare id: number;

  @AllowNull(false)
  @Column(DataType.UUID)
  userId: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  planId: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  planName: string;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  priceCents: number;

  @AllowNull(false)
  @Column(DataType.ENUM(...Object.values(SubscriptionStatus)))
  status: SubscriptionStatus;

  @AllowNull(true)
  @Column(DataType.STRING)
  stripeSubscriptionId?: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  stripeCustomerId?: string;

  @AllowNull(true)
  @Column(DataType.DATE)
  startedAt?: Date;

  @AllowNull(true)
  @Column(DataType.DATE)
  expiresAt?: Date;

  @HasMany(() => PaymentModel)
  payments: PaymentModel[];
}
