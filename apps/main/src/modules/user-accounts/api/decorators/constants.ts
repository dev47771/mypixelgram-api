//registration
export const DESCRIPT_HEAD_REGISTR = 'Registration in the sistem';
export const DESCRIPT_TEXT_REGISTR =
  'Email with confirmation code will be send to passed qmail address';
export const DESCRIPT_SUCCESS_REGISTR =
  'Input data is accepted. Email with confirmation code will be send to passed email address. Confirmation code should be inside link as query param';

//registration-email-resending
export const DESCRIPT_HEAD_RESENDING =
  'Resend confirmation registration Email if user exist';
export const DESCRIPT_SUCCESS_RESENDING =
  'Input data is accepted. Email with confirmation code will be send to passed email address. Confirmation code should be inside link as query param';
export const EXAMPLE_EMAIL_LINK_CODE =
  'https://mypixelgram.ru/confirmRegistration?code=youtcodehere';
export const DESCRIPT_BAD_REQUEST_RESENDING =
  'If the inputModel has incorrect values or if email is already confirmed';

//registration-confirmation
export const DESCRIPT_HEAD_CONFIRM = 'Confirm registration in the sistem';
export const DESCRIPT_TEXT_CONFIRM = "Changing the user's status to confirmed";
export const DESCRIPT_SUCCESS_CONFIRM =
  'Email was verified. Account was activated';
export const DESCRIPT_BAD_REQUEST_CONFIRM =
  'If the confirmation code is incorrect, expired or already been applied';

//login
export const DESCRIPT_HEAD_LOGIN = 'Try login user tothe sistem';
export const DESCRIPT_SUCCESS_LOGIN =
  'Returns JWT accessToken (expired after 10 seconds) in body and JWT refreshToken in cookie (http-only, secure) (expired after 20 seconds)';
export const DESCRIPT_BAD_REQUEST_LOGIN =
  'If the inputModel has incorrect values';
export const DESCRIPT_UNAUTHORIZED_LOGIN = 'If the password or login is wrong';

//recover-password
export const DESCRIPT_HEAD_RECOVER_PASSWORD =
  'Password recovery via Email confirmation';
export const DESCRIPT_TEXT_RECOVER_PASSWORD =
  'Email should be sent with RecoveryCode inside';
export const DESCRIPT_SUCCESS_RECOVER_PASSWORD =
  "Even if current email is not registered (for prevent user's email detection)";
export const DESCRIPT_BAD_REQUEST_RECOVER_PASSWORD =
  'If the inputModel has invalid email, example: for example 222^gmail.com';

//check-recovery-code
export const DESCRIPT_HEAD_CHECK_RECOVERY_CODE =
  'Password recovery via Email confirmation again';
export const DESCRIPT_SUCCESS_CHECK_RECOVERY =
  'Valid verification code, you can set a new password';
export const DESCRIPT_BAD_REQUEST_CHECK_RECOVERY =
  'If the recovery code is incorrect, expired or already been applied';

//set-new-password
export const DESCRIPT_HEAD_NEW_PASSWORD = 'Confirm password recovery';
export const DESCRIPT_SUCCESS_NEW_PASSWORD =
  'If code is valid and new password is accepted';
export const DESCRIPT_BAD_REQUEST_NEW_PASSWORD =
  'If the inputModel has incorrect value (for incorrect password length) or RecoveryCode is incorrect or expired';

//logout
export const DESCRIPT_HEAD_LOGOUT =
  'In cookie client must send correct refreshToken that will be revoked';
export const DESCRIPT_SUCCESS_LOGOUT = 'Successfully logged out';
export const DESCRIPT_UNAUTHORIZED_LOGOUT = 'Unauthorized';

//get-user-account
export const DESCRIPT_HEAD_GET_USER_ACC = 'Get infirmation about current user';
export const DESCRIPT_SUCCESS_USER_ACC = 'Success';
export const DESCRIPT_UNAUTHORIZED_USER_ACC = 'Unauthorized';
