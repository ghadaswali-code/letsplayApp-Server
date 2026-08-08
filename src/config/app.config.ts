export const appConfig = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const jwtSecret = process.env.JWT_SECRET;

  if (isProduction && !jwtSecret) {
    throw new Error('JWT_SECRET is required when NODE_ENV=production.');
  }

  return {
    port: Number(process.env.PORT ?? 3000),
    corsOrigins: (
      process.env.CORS_ORIGINS ?? 'http://localhost:3000,http://localhost:5173'
    )
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
    jwt: {
      secret: jwtSecret ?? 'development-secret-change-before-release',
      expiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
    },
  };
};
