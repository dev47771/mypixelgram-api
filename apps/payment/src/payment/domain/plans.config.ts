export const SUBSCRIPTION_PLANS = {
  DAY: {
    id: 'DAY',
    days: 1,
    priceCents: 199,
  },
  WEEK: {
    id: 'WEEK',
    days: 7,
    priceCents: 499,
  },
  MONTH: {
    id: 'MONTH',
    days: 30,
    priceCents: 999,
  },
  YEAR: {
    id: 'YEAR',
    days: 365,
    priceCents: 9999,
  },
} as const;
