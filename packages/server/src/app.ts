import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';

import { config } from './config';
import { errorHandler } from './middlewares/errorHandler';
import { notFoundHandler } from './middlewares/notFoundHandler';
import apiRoutes from './routes';
import { initializeSocketServer, getIO } from './sockets';
import { initNotificationSubscriber } from './services/notification-subscriber.service';

// Crear aplicación Express
const app: Express = express();
const httpServer = createServer(app);

// Configurar Socket.io con autenticación y Event Bus
const io = initializeSocketServer(httpServer);

// Inicializar subscriber de notificaciones
initNotificationSubscriber();

// Middlewares globales
app.use(helmet());
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
}));
app.use(morgan(config.isDev ? 'dev' : 'combined'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API info
app.get('/api', (_req, res) => {
  res.json({
    name: 'ConviviApp API',
    version: '0.1.0',
    status: 'running',
  });
});

// API routes
app.use('/api', apiRoutes);

// Manejadores de errores
app.use(notFoundHandler);
app.use(errorHandler);

// Iniciar servidor
const PORT = config.port;

httpServer.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║                                            ║
║   ConviviApp Server                        ║
║   Running on http://localhost:${PORT}          ║
║   Environment: ${config.nodeEnv.padEnd(23)}  ║
║                                            ║
╚════════════════════════════════════════════╝
  `);
});

// Exportar para tests
export { app, io };
