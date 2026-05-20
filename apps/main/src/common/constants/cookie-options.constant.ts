import { CookieOptions } from 'express';

const isProduction = process.env.NODE_ENV === 'production';

export const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'none',
  maxAge: 24 * 60 * 60 * 1000,
  ...(isProduction && { domain: '.mypixelgram.ru' }),
};
