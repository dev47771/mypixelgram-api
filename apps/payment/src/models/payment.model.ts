import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, AllowNull, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { SubscriptionModel } from './subscription.model';

export enum PaymentStatus {
  PENDING = 'pending',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
}

@Table({
  tableName: 'payments',
  timestamps: false,
})
export class PaymentModel extends Model<PaymentModel> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  declare id: number;

  @AllowNull(false)
  @Column(DataType.UUID)
  userId: string;

  @ForeignKey(() => SubscriptionModel)
  @AllowNull(false)
  @Column(DataType.BIGINT)
  subscriptionId: number;

  @BelongsTo(() => SubscriptionModel)
  subscription: SubscriptionModel;

  @AllowNull(false)
  @Column(DataType.STRING)
  provider: string;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  amountCents: number;

  @AllowNull(false)
  @Column(DataType.STRING(3))
  currency: string;

  @AllowNull(false)
  @Column(DataType.ENUM(...Object.values(PaymentStatus)))
  status: PaymentStatus;

  @AllowNull(true)
  @Column(DataType.STRING)
  stripePaymentIntentId?: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  stripeInvoiceId?: string;

  @AllowNull(false)
  @Column(DataType.DATE)
  declare createdAt: Date;
}
