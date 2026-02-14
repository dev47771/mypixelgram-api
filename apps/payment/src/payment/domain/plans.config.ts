import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type PlanId = 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';

export interface SubscriptionPlan {
  id: PlanId;
  days: number;
  priceCents: number;
  stripePriceId: string;
}

@Injectable()
export class SubscriptionPlansService {
  private readonly plans: Record<PlanId, SubscriptionPlan>;

  constructor(private configService: ConfigService) {
    this.plans = {
      DAY: {
        id: 'DAY',
        days: 1,
        priceCents: 199,
        stripePriceId: this.configService.get<string>('STRIPE_PRICE_DAY')!,
      },
      WEEK: {
        id: 'WEEK',
        days: 7,
        priceCents: 499,
        stripePriceId: this.configService.get<string>('STRIPE_PRICE_WEEK')!,
      },
      MONTH: {
        id: 'MONTH',
        days: 30,
        priceCents: 999,
        stripePriceId: this.configService.get<string>('STRIPE_PRICE_MONTH')!,
      },
      YEAR: {
        id: 'YEAR',
        days: 365,
        priceCents: 9999,
        stripePriceId: this.configService.get<string>('STRIPE_PRICE_YEAR')!,
      },
    };
  }

  getPlan(planId: PlanId): SubscriptionPlan {
    const plan = this.plans[planId];
    if (!plan) throw new Error(`Invalid subscription plan: ${planId}`);
    return plan;
  }
}
