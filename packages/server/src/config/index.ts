import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

export const config = {
  // Entorno
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev: process.env.NODE_ENV !== 'production',
  isProd: process.env.NODE_ENV === 'production',

  // Servidor
  port: parseInt(process.env.PORT || '3000', 10),

  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },

  // Base de datos
  databaseUrl: process.env.DATABASE_URL || '',

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  // Bcrypt
  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10),
  },
} as const;

// Validación de configuración crítica en producción
if (config.isProd) {
  const required = ['DATABASE_URL', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Variables de entorno faltantes: ${missing.join(', ')}`);
  }

  if (config.jwt.secret === 'dev-secret-change-in-production') {
    throw new Error('JWT_SECRET debe ser configurado en producción');
  }

  if (config.jwt.refreshSecret === 'dev-refresh-secret-change-in-production') {
    throw new Error('JWT_REFRESH_SECRET debe ser configurado en producción');
  }
}
