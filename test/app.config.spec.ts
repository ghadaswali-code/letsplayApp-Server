import { appConfig } from '../src/config/app.config';

describe('appConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.NODE_ENV;
    delete process.env.JWT_SECRET;
    delete process.env.CORS_ORIGINS;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('requires JWT_SECRET in production', () => {
    process.env.NODE_ENV = 'production';

    expect(() => appConfig()).toThrow(
      'JWT_SECRET is required when NODE_ENV=production.',
    );
  });

  it('uses local CORS defaults when CORS_ORIGINS is not provided', () => {
    expect(appConfig().corsOrigins).toEqual([
      'http://localhost:3000',
      'http://localhost:5173',
    ]);
  });

  it('trims configured CORS origins', () => {
    process.env.CORS_ORIGINS =
      ' https://app.example.com,https://admin.example.com ';

    expect(appConfig().corsOrigins).toEqual([
      'https://app.example.com',
      'https://admin.example.com',
    ]);
  });
});
