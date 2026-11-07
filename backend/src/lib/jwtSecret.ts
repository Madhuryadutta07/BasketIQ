/**
 * JWT secret used to sign and verify tokens.
 * In production JWT_SECRET must be set (Render generates one automatically via render.yaml).
 * In local development a fixed fallback is used so the app works without a .env.
 */
export const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET is not set');
  }
  return 'basketiq_dev_secret';
};
