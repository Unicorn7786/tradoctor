const EventEmitter = require('events');
const axios = require('axios');
const { SMA, EMA, MACD, RSI } = require('technicalindicators');
const logger = require('../utils/logger');
const GeminiTechnicalAnalysisService = require('../services/GeminiTechnicalAnalysisService');

class TechnicalAnalyst extends EventEmitter {
  constructor(io) {
    super();
    this.io = io;
    this.running = false;
    this.watchlist = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'];
    this.analysisCache = new Map();
    this.geminiService = new GeminiTechnicalAnalysisService();
    this.updateInterval = 60 * 1000; // 1 minute
    
    this.indicators = {
      sma200: true,
      sma50: true,
      ema20: true,
      macd: true,
      rsi: true
    };
  }

  async start() {
    if (this.running) return;
    
    this.running = true;
    logger.info('TechnicalAnalyst: Starting technical analysis agent');
    
    await this.analyzeTechnicalForWatchlist();
    
    this.intervalId = setInterval(() => {
      this.analyzeTechnicalForWatchlist();
    }, this.updateInterval);
    
    this.emit('started');
  }

  async stop() {
    if (!this.running) return;
    
    this.running = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    
    logger.info('TechnicalAnalyst: Stopped');
    this.emit('stopped');
  }

  async analyzeTechnicalForWatchlist() {
    for (const symbol of this.watchlist) {
      try {
        await this.analyzeTechnical(symbol);
      } catch (error) {
        logger.error(`TechnicalAnalyst: Error analyzing ${symbol}:`, error);
      }
    }
  }

  async analyzeTechnical(symbol) {
    logger.info(`TechnicalAnalyst: Analyzing ${symbol}`);
    
    try {
      const priceData = await this.fetchPriceData(symbol);
      const indicators = this.calculateIndicators(priceData);
      const optionsFlow = await this.fetchOptionsFlow(symbol);
      
      const aiAnalysis = await this.geminiService.analyzeTechnicalIndicators(symbol, {
        ...indicators,
        options: optionsFlow
      });
      
      const technicalAnalysis = {
        symbol,
        indicators,
        optionsFlow,
        aiAnalysis,
        signals: this.generateSignals(indicators, optionsFlow),
        timestamp: new Date().toISOString()
      };
      
      this.analysisCache.set(symbol, technicalAnalysis);
      
      this.io.to(symbol).emit('technicalUpdate', {
        symbol,
        analysis: technicalAnalysis,
        timestamp: new Date().toISOString()
      });
      
      this.emit('technicalAnalyzed', { symbol, analysis: technicalAnalysis });
      
      return technicalAnalysis;
    } catch (error) {
      logger.error(`TechnicalAnalyst: Failed to analyze ${symbol}:`, error);
      throw error;
    }
  }

  calculateIndicators(priceData) {
    const closes = priceData.map(d => d.close);
    const highs = priceData.map(d => d.high);
    const lows = priceData.map(d => d.low);
    const volumes = priceData.map(d => d.volume);
    
    const indicators = {
      currentPrice: closes[closes.length - 1]
    };
    
    if (this.indicators.sma200 && closes.length >= 200) {
      indicators.ma200 = SMA.calculate({ period: 200, values: closes }).slice(-1)[0];
    }
    
    if (this.indicators.sma50 && closes.length >= 50) {
      indicators.ma50 = SMA.calculate({ period: 50, values: closes }).slice(-1)[0];
    }
    
    if (this.indicators.ema20 && closes.length >= 20) {
      indicators.ema20 = EMA.calculate({ period: 20, values: closes }).slice(-1)[0];
    }
    
    if (this.indicators.macd && closes.length >= 26) {
      const macdResult = MACD.calculate({
        values: closes,
        fastPeriod: 12,
        slowPeriod: 26,
        signalPeriod: 9
      });
      
      if (macdResult.length > 0) {
        const latest = macdResult[macdResult.length - 1];
        indicators.macd = {
          macdLine: latest.MACD,
          signalLine: latest.signal,
          histogram: latest.histogram
        };
      }
    }
    
    if (this.indicators.rsi && closes.length >= 14) {
      indicators.rsi = RSI.calculate({ period: 14, values: closes }).slice(-1)[0];
    }
    
    // Volume analysis
    const avgVolume = volumes.slice(-20).reduce((sum, vol) => sum + vol, 0) / 20;
    indicators.volume = {
      current: volumes[volumes.length - 1],
      average: avgVolume,
      ratio: volumes[volumes.length - 1] / avgVolume
    };
    
    return indicators;
  }

  generateSignals(indicators, optionsFlow) {
    const signals = [];
    
    // Moving average signals
    if (indicators.currentPrice && indicators.ma50 && indicators.ma200) {
      if (indicators.currentPrice > indicators.ma50 && indicators.ma50 > indicators.ma200) {
        signals.push({ type: 'BULLISH', source: 'MA_TREND', strength: 7 });
      } else if (indicators.currentPrice < indicators.ma50 && indicators.ma50 < indicators.ma200) {
        signals.push({ type: 'BEARISH', source: 'MA_TREND', strength: 7 });
      }
    }
    
    // RSI signals
    if (indicators.rsi) {
      if (indicators.rsi > 70) {
        signals.push({ type: 'BEARISH', source: 'RSI_OVERBOUGHT', strength: 6 });
      } else if (indicators.rsi < 30) {
        signals.push({ type: 'BULLISH', source: 'RSI_OVERSOLD', strength: 6 });
      }
    }
    
    // MACD signals
    if (indicators.macd) {
      if (indicators.macd.macdLine > indicators.macd.signalLine && indicators.macd.histogram > 0) {
        signals.push({ type: 'BULLISH', source: 'MACD_BULLISH', strength: 6 });
      } else if (indicators.macd.macdLine < indicators.macd.signalLine && indicators.macd.histogram < 0) {
        signals.push({ type: 'BEARISH', source: 'MACD_BEARISH', strength: 6 });
      }
    }
    
    // Volume signals
    if (indicators.volume.ratio > 2) {
      signals.push({ type: 'VOLUME_SPIKE', source: 'VOLUME', strength: 5 });
    }
    
    // Options flow signals
    if (optionsFlow.putCallRatio > 1.5) {
      signals.push({ type: 'BEARISH', source: 'OPTIONS_FLOW', strength: 6 });
    } else if (optionsFlow.putCallRatio < 0.5) {
      signals.push({ type: 'BULLISH', source: 'OPTIONS_FLOW', strength: 6 });
    }
    
    return signals;
  }

  async fetchPriceData(symbol) {
    // Mock implementation - replace with real market data API
    const mockData = [];
    const basePrice = 150;
    
    for (let i = 0; i < 250; i++) {
      const price = basePrice + Math.random() * 20 - 10;
      mockData.push({
        date: new Date(Date.now() - (250 - i) * 24 * 60 * 60 * 1000),
        open: price,
        high: price + Math.random() * 5,
        low: price - Math.random() * 5,
        close: price + Math.random() * 2 - 1,
        volume: Math.floor(Math.random() * 1000000) + 500000
      });
    }
    
    return mockData;
  }

  async fetchOptionsFlow(symbol) {
    // Mock implementation - replace with real options data API
    return {
      totalVolume: Math.floor(Math.random() * 100000) + 10000,
      callVolume: Math.floor(Math.random() * 60000) + 5000,
      putVolume: Math.floor(Math.random() * 40000) + 5000,
      putCallRatio: Math.random() * 2 + 0.5,
      maxPain: 150 + Math.random() * 20 - 10
    };
  }

  getAnalysis(symbol) {
    return this.analysisCache.get(symbol);
  }

  addToWatchlist(symbol) {
    if (!this.watchlist.includes(symbol)) {
      this.watchlist.push(symbol);
      logger.info(`TechnicalAnalyst: Added ${symbol} to watchlist`);
    }
  }

  removeFromWatchlist(symbol) {
    const index = this.watchlist.indexOf(symbol);
    if (index > -1) {
      this.watchlist.splice(index, 1);
      logger.info(`TechnicalAnalyst: Removed ${symbol} from watchlist`);
    }
  }

  isRunning() {
    return this.running;
  }
}

module.exports = TechnicalAnalyst;