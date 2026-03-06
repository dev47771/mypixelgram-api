import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, AllowNull, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { SubscriptionModel } from './subscription.model';

export enum PaymentStatus {
  PENDING = 'pending',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
}

@Table({ tableName: 'payments', timestamps: false })
export class PaymentModel extends Model<PaymentModel> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  declare id: number;

  @AllowNull(false)
  @Column(DataType.UUID)
  declare userId: string;

  @ForeignKey(() => SubscriptionModel)
  @AllowNull(false)
  @Column(DataType.BIGINT)
  declare subscriptionId: number;

  @BelongsTo(() => SubscriptionModel)
  declare subscription?: SubscriptionModel;

  @AllowNull(false)
  @Column(DataType.STRING)
  declare provider: string;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare amountCents: number;

  @AllowNull(false)
  @Column(DataType.STRING(3))
  declare currency: string;

  @AllowNull(false)
  @Column(DataType.ENUM(...Object.values(PaymentStatus)))
  declare status: PaymentStatus;

  @AllowNull(true)
  @Column(DataType.STRING)
  declare stripePaymentIntentId?: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  declare stripeInvoiceId?: string;

  @AllowNull(false)
  @Column(DataType.DATE)
  declare createdAt: Date;
}
