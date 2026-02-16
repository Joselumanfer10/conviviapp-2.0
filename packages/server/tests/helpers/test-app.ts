import express, { type Express } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import apiRoutes from '../../src/routes';
import { errorHandler } from '../../src/middlewares/errorHandler';
import { notFoundHandler } from '../../src/middlewares/notFoundHandler';

// Crear una instancia de la app para testing (sin Socket.io)
export function createTestApp(): Express {
  const app = express();

  // Middlewares básicos
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Rutas
  app.use('/api', apiRoutes);

  // Manejadores de errores
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

// Singleton para reutilizar
let testApp: Express | null = null;

export function getTestApp(): Express {
  if (!testApp) {
    testApp = createTestApp();
  }
  return testApp;
}
