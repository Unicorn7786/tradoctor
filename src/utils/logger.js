const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Define console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss'
  }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { 
    service: 'trading-agent-system',
    version: process.env.npm_package_version || '1.0.0'
  },
  transports: [
    // Write all logs with level 'error' and below to 'error.log'
    new winston.transports.File({ 
      filename: path.join(logsDir, 'error.log'), 
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 5
    }),
    
    // Write all logs with level 'info' and below to 'combined.log'
    new winston.transports.File({ 
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 10485760, // 10MB
      maxFiles: 10
    }),
    
    // Separate log files for different agents
    new winston.transports.File({
      filename: path.join(logsDir, 'technical-analyst.log'),
      level: 'info',
      format: winston.format.combine(
        winston.format.label({ label: 'TechnicalAnalyst' }),
        winston.format.timestamp(),
        winston.format.printf(info => `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`)
      )
    }),
    
    new winston.transports.File({
      filename: path.join(logsDir, 'sentiment-analyst.log'),
      level: 'info',
      format: winston.format.combine(
        winston.format.label({ label: 'SentimentAnalyst' }),
        winston.format.timestamp(),
        winston.format.printf(info => `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`)
      )
    }),
    
    new winston.transports.File({
      filename: path.join(logsDir, 'options-flow-analyst.log'),
      level: 'info',
      format: winston.format.combine(
        winston.format.label({ label: 'OptionsFlowAnalyst' }),
        winston.format.timestamp(),
        winston.format.printf(info => `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`)
      )
    }),
    
    new winston.transports.File({
      filename: path.join(logsDir, 'valuation-analyst.log'),
      level: 'info',
      format: winston.format.combine(
        winston.format.label({ label: 'ValuationAnalyst' }),
        winston.format.timestamp(),
        winston.format.printf(info => `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`)
      )
    }),
    
    new winston.transports.File({
      filename: path.join(logsDir, 'trader-agent.log'),
      level: 'info',
      format: winston.format.combine(
        winston.format.label({ label: 'TraderAgent' }),
        winston.format.timestamp(),
        winston.format.printf(info => `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`)
      )
    })
  ],
  
  // Handle exceptions and rejections
  exceptionHandlers: [
    new winston.transports.File({ filename: path.join(logsDir, 'exceptions.log') })
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: path.join(logsDir, 'rejections.log') })
  ]
});

// If we're not in production, log to the console with a simple format
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple(),
      winston.format.printf(info => {
        const timestamp = new Date().toISOString();
        return `${timestamp} ${info.level}: ${info.message}`;
      })
    )
  }));
}

// Add a method to create child loggers for specific components
logger.createChildLogger = (label) => {
  return logger.child({ 
    component: label,
    format: winston.format.combine(
      winston.format.label({ label }),
      winston.format.timestamp(),
      winston.format.printf(info => `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`)
    )
  });
};

// Performance logging helper
logger.performance = (label, startTime) => {
  const duration = Date.now() - startTime;
  logger.info(`Performance: ${label} completed in ${duration}ms`);
  return duration;
};

// Error context helper
logger.errorWithContext = (message, error, context = {}) => {
  logger.error(message, {
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name
    },
    context
  });
};

// Trading-specific log methods
logger.trade = (action, symbol, data = {}) => {
  logger.info(`TRADE: ${action} ${symbol}`, {
    action,
    symbol,
    ...data,
    type: 'trade'
  });
};

logger.signal = (type, source, symbol, strength, data = {}) => {
  logger.info(`SIGNAL: ${type} from ${source} for ${symbol} (strength: ${strength})`, {
    signalType: type,
    source,
    symbol,
    strength,
    ...data,
    type: 'signal'
  });
};

logger.analysis = (analyst, symbol, result) => {
  logger.info(`ANALYSIS: ${analyst} completed analysis for ${symbol}`, {
    analyst,
    symbol,
    result: typeof result === 'object' ? JSON.stringify(result) : result,
    type: 'analysis'
  });
};

// System monitoring
logger.system = (metric, value, unit = '') => {
  logger.info(`SYSTEM: ${metric} = ${value}${unit}`, {
    metric,
    value,
    unit,
    type: 'system'
  });
};

// API request logging
logger.api = (method, url, statusCode, duration, data = {}) => {
  const level = statusCode >= 400 ? 'error' : 'info';
  logger[level](`API: ${method} ${url} ${statusCode} (${duration}ms)`, {
    method,
    url,
    statusCode,
    duration,
    ...data,
    type: 'api'
  });
};

module.exports = logger; 