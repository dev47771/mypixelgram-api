// HEADERS
export const DESCRIPT_HEAD_CREATE_CHECKOUT = 'Create subscription checkout session';
export const DESCRIPT_HEAD_GET_PAYMENTS = 'Get user payment history with pagination';
export const DESCRIPT_HEAD_SUCCESS = 'Payment success page';
export const DESCRIPT_HEAD_ERROR = 'Payment error page';

// DESCRIPTIONS
export const DESCRIPT_DESC_CREATE_CHECKOUT = `Creates Stripe payment link for subscription.

Current subscription stays active until new payment succeeds.
Link click doesn't cancel existing subscription.
Cancel payment = keep current subscription.

💰 Available plans:

• DAY (1 day) = $1.99

• WEEK (7 days) = $4.99  

• MONTH (30 days) = $9.99

• YEAR (365 days) = $99.99

🧪 **TEST CARD:**
4242 4242 4242 4242
Date: 12/34 | CVC: 123`;

export const DESCRIPT_DESC_GET_PAYMENTS = 'Returns payment history for authorized user with pagination. Shows payment date, amount, end date, subscription type and provider.';

// SUCCESS
export const DESCRIPT_SUCCESS_CREATE_CHECKOUT = 'Checkout session created successfully';
export const DESCRIPT_SUCCESS_GET_PAYMENTS = 'Payment history retrieved successfully';
export const DESCRIPT_SUCCESS_SUCCESS_PAGE = 'Payment completed successfully';
export const DESCRIPT_SUCCESS_ERROR_PAGE = 'Payment failed or canceled';

// ERRORS
export const DESCRIPT_BAD_REQUEST_CHECKOUT = 'Invalid planId or request parameters';
export const DESCRIPT_BAD_REQUEST_PAYMENTS = 'Invalid page or limit parameters';
export const DESCRIPT_UNAUTHORIZED = 'JWT token is missing or invalid';
