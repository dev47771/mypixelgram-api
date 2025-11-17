//registration
export const DESCRIPT_HEAD_REGISTR = 'Registration in the sistem';
export const DESCRIPT_TEXT_REGISTR = 'Email with confirmation code will be send to passed qmail address';
export const DESCRIPT_SUCCESS_REGISTR = 'Input data is accepted. Email with confirmation code will be send to passed email address. Confirmation code should be inside link as query param';

//registration-email-resending
export const DESCRIPT_HEAD_RESENDING = 'Resend confirmation registration Email if user exist';
export const DESCRIPT_SUCCESS_RESENDING = 'Input data is accepted. Email with confirmation code will be send to passed email address. Confirmation code should be inside link as query param';
export const EXAMPLE_EMAIL_LINK_CODE = 'https://mypixelgram.ru/confirmRegistration?code=youtcodehere';
export const DESCRIPT_BAD_REQUEST_RESENDING = 'If the inputModel has incorrect values or if email is already confirmed';

//registration-confirmation
export const DESCRIPT_HEAD_CONFIRM = 'Confirm registration in the sistem';
export const DESCRIPT_TEXT_CONFIRM = "Changing the user's status to confirmed";
export const DESCRIPT_SUCCESS_CONFIRM = 'Email was verified. Account was activated';
export const DESCRIPT_BAD_REQUEST_CONFIRM = 'If the confirmation code is incorrect, expired or already been applied';

//login
export const DESCRIPT_HEAD_LOGIN = 'Try login user tothe sistem';
export const DESCRIPT_SUCCESS_LOGIN = 'Returns JWT accessToken in body and JWT refreshToken in cookie (http-only, secure). Token expiration times are determined via environment variables.';
export const DESCRIPT_BAD_REQUEST_LOGIN = 'If the inputModel has incorrect values';
export const DESCRIPT_UNAUTHORIZED_LOGIN = 'If the password or login is wrong';

//recover-password
export const DESCRIPT_HEAD_RECOVER_PASSWORD = 'Password recovery via Email confirmation';
export const DESCRIPT_TEXT_RECOVER_PASSWORD = 'Email should be sent with RecoveryCode inside';
export const DESCRIPT_SUCCESS_RECOVER_PASSWORD = "Even if current email is not registered (for prevent user's email detection)";
export const DESCRIPT_BAD_REQUEST_RECOVER_PASSWORD = 'If the inputModel has invalid email, example: for example 222^gmail.com';

//check-recovery-code
export const DESCRIPT_HEAD_CHECK_RECOVERY_CODE = 'Password recovery via Email confirmation again';
export const DESCRIPT_SUCCESS_CHECK_RECOVERY = 'Valid verification code, you can set a new password';
export const DESCRIPT_BAD_REQUEST_CHECK_RECOVERY = 'If the recovery code is incorrect, expired or already been applied';

//set-new-password
export const DESCRIPT_HEAD_NEW_PASSWORD = 'Confirm password recovery';
export const DESCRIPT_SUCCESS_NEW_PASSWORD = 'If code is valid and new password is accepted';
export const DESCRIPT_BAD_REQUEST_NEW_PASSWORD = 'If the inputModel has incorrect value (for incorrect password length) or RecoveryCode is incorrect or expired';

//logout
export const DESCRIPT_HEAD_LOGOUT = 'In cookie client must send correct refreshToken that will be revoked';
export const DESCRIPT_SUCCESS_LOGOUT = 'Successfully logged out';
export const DESCRIPT_UNAUTHORIZED_LOGOUT = 'Unauthorized';

// get-user-account
export const DESCRIPT_HEAD_GET_USER_ACC = 'Get info about current user';
export const DESCRIPT_TEXT_GET_USER_ACC = 'Returns basic account info of the authenticated user. Requires Authorization header with a valid JWT access token.';
export const DESCRIPT_SUCCESS_USER_ACC = 'User info returned successfully.';
export const DESCRIPT_UNAUTHORIZED_USER_ACC = 'Access denied. Missing or invalid JWT token.';

//refresh-token
export const DESCRIPT_HEAD_REFRESH_TOKEN = 'Generate new pair of access and refresh tokens';
export const DESCRIPT_TEXT_REFRESH_TOKEN = 'In cookie clients must send correct refreshToken that will be revokked after refreshing. Device LastActiveDate should be issued Date of new refresh token';
export const DESCRIPT_UNAUTHORIZED_REFRESH_TOKEN = 'Unauthorized';
export const DESCRIPT_SUCCESS_TOKENS_ISSUED = 'Returns JWT accessToken in body and JWT refreshToken in cookie (http-only, secure). Token expiration times are set via environment variables.';
//reCAPTCHA
export const RECAPTCHA_ACTION = 'recaptcha_action';
export const RECAPTCHA_SKIP = 'recaptcha_skip';

// github oauth
export const DESCRIPT_HEAD_GITHUB_AUTH = 'GitHub OAuth authorization';
export const DESCRIPT_TEXT_GITHUB_AUTH =
  'Redirects the user to the GitHub authorization page. This endpoint initiates the OAuth2 authorization process. After successful authorization, GitHub will redirect the user to the callback endpoint defined in the strategy. No request parameters are required.';
export const DESCRIPT_SUCCESS_GITHUB_AUTH = 'Successful initialization of the OAuth process. The user is redirected to GitHub for authentication.';
export const DESCRIPT_UNAUTHORIZED_GITHUB_AUTH = 'Authorization error or provider response failure. Occurs if GitHub OAuth cannot be initialized.';

export const DESCRIPT_HEAD_GITHUB_CALLBACK = 'GitHub OAuth callback';
export const DESCRIPT_TEXT_GITHUB_CALLBACK =
  'Receives the callback from GitHub after successful authorization. The endpoint extracts user data (GitHub ID, login, email, avatar, tokens) and completes login or registration in the system. On success, sets secure HttpOnly cookies and redirects to a success URL. On failure, redirects to an error URL.';
export const DESCRIPT_SUCCESS_GITHUB_CALLBACK = 'Successful OAuth callback. Secure cookie with refresh token is set, and the user is redirected to the success page.';
export const DESCRIPT_ERROR_GITHUB_CALLBACK = 'Token or user registration error during callback processing. The user is redirected to the error page.';

// google oauth
export const DESCRIPT_HEAD_GOOGLE_AUTH = 'Google OAuth authorization';
export const DESCRIPT_TEXT_GOOGLE_AUTH =
  'Redirects the user to the Google authorization page. This endpoint initiates the OAuth2 authorization process. After successful authorization, Google will redirect the user to the callback endpoint defined in the strategy. No request parameters are required.';
export const DESCRIPT_SUCCESS_GOOGLE_AUTH = 'Successful initialization of the OAuth process. The user is redirected to Google for authentication.';
export const DESCRIPT_UNAUTHORIZED_GOOGLE_AUTH = 'Authorization error or provider response failure. Occurs if Google OAuth cannot be initialized.';

export const DESCRIPT_HEAD_GOOGLE_CALLBACK = 'Google OAuth callback';
export const DESCRIPT_TEXT_GOOGLE_CALLBACK =
  'Handles the callback from Google after successful user authorization. Extracts user data (Google ID, email, login, avatar, tokens) and completes registration or login in the system. On success, sets an HttpOnly refresh token cookie and redirects to the profile page. On error, redirects to the error page.';
export const DESCRIPT_SUCCESS_GOOGLE_CALLBACK = 'Successful OAuth callback. The refresh token is set as a secure cookie, and the user is redirected to the success page.';
export const DESCRIPT_ERROR_GOOGLE_CALLBACK = 'Registration or token error during callback processing. The user is redirected to the error page.';
