const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const logger = require('./utils/logger');
const connectDB = require('./config/database');
const connectRedis = require('./config/redis');

// Import agents
const TechnicalAnalyst = require('./agents/TechnicalAnalyst');
const SentimentAnalyst = require('./agents/SentimentAnalyst');
const OptionsFlowAnalyst = require('./agents/OptionsFlowAnalyst');
const ValuationAnalyst = require('./agents/ValuationAnalyst');
const TraderAgent = require('./agents/TraderAgent');

// Import routes
const analysisRoutes = require('./routes/analysis');
const watchlistRoutes = require('./routes/watchlist');
const signalsRoutes = require('./routes/signals');
const notificationsRoutes = require('./routes/notifications');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? false : "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
}

// Initialize agents
let technicalAnalyst, sentimentAnalyst, optionsFlowAnalyst, valuationAnalyst, traderAgent;

// Routes
app.use('/api/analysis', analysisRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/signals', signalsRoutes);
app.use('/api/notifications', notificationsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    agents: {
      technical: technicalAnalyst?.isRunning() || false,
      sentiment: sentimentAnalyst?.isRunning() || false,
      optionsFlow: optionsFlowAnalyst?.isRunning() || false,
      valuation: valuationAnalyst?.isRunning() || false,
      trader: traderAgent?.isRunning() || false
    }
  });
});

// Socket.IO for real-time updates
io.on('connection', (socket) => {
  logger.info('Client connected:', socket.id);
  
  socket.on('subscribe', (symbol) => {
    socket.join(symbol);
    logger.info(`Client ${socket.id} subscribed to ${symbol}`);
  });
  
  socket.on('unsubscribe', (symbol) => {
    socket.leave(symbol);
    logger.info(`Client ${socket.id} unsubscribed from ${symbol}`);
  });
  
  socket.on('disconnect', () => {
    logger.info('Client disconnected:', socket.id);
  });
});

// Initialize system
async function initializeSystem() {
  try {
    // Connect to databases
    await connectDB();
    await connectRedis();
    
    logger.info('Databases connected successfully');
    
    // Initialize agents
    technicalAnalyst = new TechnicalAnalyst(io);
    sentimentAnalyst = new SentimentAnalyst(io);
    optionsFlowAnalyst = new OptionsFlowAnalyst(io);
    valuationAnalyst = new ValuationAnalyst(io);
    traderAgent = new TraderAgent(io, {
      technicalAnalyst,
      sentimentAnalyst,
      optionsFlowAnalyst,
      valuationAnalyst
    });
    
    // Start agents
    await technicalAnalyst.start();
    await sentimentAnalyst.start();
    await optionsFlowAnalyst.start();
    await valuationAnalyst.start();
    await traderAgent.start();
    
    logger.info('All trading agents started successfully');
    
  } catch (error) {
    logger.error('Failed to initialize system:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  
  if (technicalAnalyst) await technicalAnalyst.stop();
  if (sentimentAnalyst) await sentimentAnalyst.stop();
  if (optionsFlowAnalyst) await optionsFlowAnalyst.stop();
  if (valuationAnalyst) await valuationAnalyst.stop();
  if (traderAgent) await traderAgent.stop();
  
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  
  if (technicalAnalyst) await technicalAnalyst.stop();
  if (sentimentAnalyst) await sentimentAnalyst.stop();
  if (optionsFlowAnalyst) await optionsFlowAnalyst.stop();
  if (valuationAnalyst) await valuationAnalyst.stop();
  if (traderAgent) await traderAgent.stop();
  
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

// Error handling
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 3000;

// Start server
server.listen(PORT, () => {
  logger.info(`Trading Agent System running on port ${PORT}`);
  initializeSystem();
});

module.exports = { app, server, io }; 