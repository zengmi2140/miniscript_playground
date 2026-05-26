const DEFAULT_APP_URL = 'http://localhost:3000';

export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || DEFAULT_APP_URL;

export const APP_URL_DISPLAY = APP_URL
  .replace(/^https?:\/\//, '')
  .replace(/\/+$/, '');
