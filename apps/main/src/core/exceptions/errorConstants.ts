// src/constants/errorConstants.ts

export const ErrorConstants = {
  // Ошибки формы (валидация)
  INVALID_EMAIL: 'Некорректный email',
  REQUIRED_FIELD: 'Это поле обязательно',
  PASSWORD_WEAK: 'Пароль должен содержать буквы, цифры и спецсимволы',
  EMAIL_ALREADY_EXISTS: 'Пользователь с таким email уже зарегистрирован',
  INVALID_CODE: 'Недопустимый код подтверждения',
  FIELD_TOO_SHORT: 'Поле слишком короткое',
  FIELD_TOO_LONG: 'Поле слишком длинное',
  INVALID_PASSWORD: 'Некорректный пароль',

  // Служебные ошибки
  NO_REFRESH_COOKIE: 'Отсутствует refresh-токен в куках',
  REFRESH_TOKEN_EXPIRED: 'Refresh-токен устарел',
  REFRESH_TOKEN_INVALID: 'Refresh-токен недействителен',
  REFRESH_TOKEN_SESSION_MISMATCH: 'Refresh-токен не соответствует сессии',
  CONFIRMATION_CODE_INVALID:
    'Код подтверждения неверен, устарел или уже был использован',
  USER_ALREADY_CONFIRMED_CODE: 'Пользователь уже подтверждён',
  CONFIRMATION_LINK_EXPIRED: 'Ссылка для подтверждения в email устарела',
  SESSION_NOT_FOUND: 'Сессия не существует',
  USER_WITH_EMAIL_NOT_EXIST: 'Пользователь с указанным email не существует',
  USER_ALREADY_CONFIRMED: 'Пользователь уже подтверждён',
  RECOVERY_CODE_INCORRECT: 'Код восстановления некорректен',
  RECOVERY_CODE_EXPIRED: 'Код восстановления устарел',
  USER_NOT_CONFIRMED: 'Пользователь не подтверждён',
  USER_NOT_FOUND: 'Пользователь не найден',
  UNAUTHORIZED: 'Нет доступа (авторизация не пройдена)',
  FORBIDDEN: 'Доступ запрещён',
  INTERNAL_SERVER_ERROR: 'Внутренняя ошибка сервера',
  EMAIL_SEND_FAILED: 'Ошибка отправки email',
  INVALID_CREDENTIALS: 'Неверные данные для входа',
  ACTION_NOT_ALLOWED: 'Действие недоступно',
  REGISTRATION_FAILED: 'Ошибка регистрации пользователя',
  RECAPTCHA_TOKEN_REQUIRED: 'Требуется токен reCAPTCHA',
  RECAPTCHA_VERIFICATION_FAILED: 'Проверка reCAPTCHA не пройдена',
  LOGIN_ALREADY_TAKEN: 'Логин уже занят',
  EMAIL_ALREADY_TAKEN: 'Email уже используется',
};
