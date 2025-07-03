#!/usr/bin/env node

/**
 * Agent Even - Development Agent for Even-numbered Tasks
 * Handles tasks: 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38
 */

const fs = require('fs');
const path = require('path');

class AgentEven {
  constructor() {
    this.name = 'Agent Even';
    this.tasks = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38];
    this.currentTask = null;
    this.completedTasks = [];
    this.workspaceRoot = path.resolve(__dirname, '..');
  }

  log(message) {
    console.log(`[${this.name}] ${new Date().toISOString()} - ${message}`);
  }

  async start() {
    this.log('Starting development agent for even-numbered tasks...');
    
    const nextTask = this.getNextTask();
    if (nextTask) {
      await this.executeTask(nextTask);
    } else {
      this.log('All even-numbered tasks completed!');
    }
  }

  getNextTask() {
    for (const taskNum of this.tasks) {
      if (!this.completedTasks.includes(taskNum)) {
        return taskNum;
      }
    }
    return null;
  }

  async executeTask(taskNum) {
    this.currentTask = taskNum;
    this.log(`Starting Task ${taskNum}`);

    switch (taskNum) {
      case 6:
        await this.task6_ImplementTechnicalAnalyst();
        break;
      case 8:
        await this.task8_TechnicalAnalystTests();
        break;
      case 10:
        await this.task10_IntegrateGeminiLangChainSentiment();
        break;
      case 12:
        await this.task12_ImplementOptionsFlowAnalyst();
        break;
      case 14:
        await this.task14_OptionsFlowAnalystTests();
        break;
      case 16:
        await this.task16_IntegrateGeminiFundamentalAnalysis();
        break;
      case 18:
        await this.task18_ImplementTraderAgent();
        break;
      case 20:
        await this.task20_TraderAgentTests();
        break;
      case 22:
        await this.task22_ImplementWebSocket();
        break;
      case 24:
        await this.task24_TwilioSMSNotifications();
        break;
      case 26:
        await this.task26_NotificationSystemTests();
        break;
      case 28:
        await this.task28_PM2ProcessManagement();
        break;
      case 30:
        await this.task30_PrometheusMonitoring();
        break;
      case 32:
        await this.task32_ELKLogging();
        break;
      case 34:
        await this.task34_ProductionDeploymentPrep();
        break;
      case 36:
        await this.task36_FinalEndToEndTests();
        break;
      case 38:
        await this.task38_ProductionDeploymentPrep();
        break;
      default:
        this.log(`Task ${taskNum} implementation not yet defined`);
    }

    this.completedTasks.push(taskNum);
    this.log(`Completed Task ${taskNum}`);
    
    const nextTask = this.getNextTask();
    if (nextTask) {
      setTimeout(() => this.executeTask(nextTask), 1000);
    }
  }

  async task6_ImplementTechnicalAnalyst() {
    this.log('Implementing Technical Analyst agent core logic...');
    
    const technicalAnalyst = `const EventEmitter = require('events');
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
        logger.error(\`TechnicalAnalyst: Error analyzing \${symbol}:\`, error);
      }
    }
  }

  async analyzeTechnical(symbol) {
    logger.info(\`TechnicalAnalyst: Analyzing \${symbol}\`);
    
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
      logger.error(\`TechnicalAnalyst: Failed to analyze \${symbol}:\`, error);
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
      logger.info(\`TechnicalAnalyst: Added \${symbol} to watchlist\`);
    }
  }

  removeFromWatchlist(symbol) {
    const index = this.watchlist.indexOf(symbol);
    if (index > -1) {
      this.watchlist.splice(index, 1);
      logger.info(\`TechnicalAnalyst: Removed \${symbol} from watchlist\`);
    }
  }

  isRunning() {
    return this.running;
  }
}

module.exports = TechnicalAnalyst;`;

    this.writeFile('src/agents/TechnicalAnalyst.js', technicalAnalyst);
    this.log('✅ Created TechnicalAnalyst.js');
  }

  async task12_ImplementOptionsFlowAnalyst() {
    this.log('Implementing Options Flow Analyst agent core logic...');
    
    const optionsFlowAnalyst = `const EventEmitter = require('events');
const axios = require('axios');
const logger = require('../utils/logger');
const GeminiService = require('../services/GeminiService');

class OptionsFlowAnalyst extends EventEmitter {
  constructor(io) {
    super();
    this.io = io;
    this.running = false;
    this.watchlist = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'];
    this.flowCache = new Map();
    this.geminiService = new GeminiService();
    this.updateInterval = 30 * 1000; // 30 seconds
    
    this.thresholds = {
      largeTradeSize: 1000,
      unusualVolumeMultiplier: 3,
      highGammaThreshold: 0.1
    };
  }

  async start() {
    if (this.running) return;
    
    this.running = true;
    logger.info('OptionsFlowAnalyst: Starting options flow analysis agent');
    
    await this.analyzeOptionsFlowForWatchlist();
    
    this.intervalId = setInterval(() => {
      this.analyzeOptionsFlowForWatchlist();
    }, this.updateInterval);
    
    this.emit('started');
  }

  async stop() {
    if (!this.running) return;
    
    this.running = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    
    logger.info('OptionsFlowAnalyst: Stopped');
    this.emit('stopped');
  }

  async analyzeOptionsFlowForWatchlist() {
    for (const symbol of this.watchlist) {
      try {
        await this.analyzeOptionsFlow(symbol);
      } catch (error) {
        logger.error(\`OptionsFlowAnalyst: Error analyzing \${symbol}:\`, error);
      }
    }
  }

  async analyzeOptionsFlow(symbol) {
    logger.info(\`OptionsFlowAnalyst: Analyzing options flow for \${symbol}\`);
    
    try {
      const optionsData = await this.fetchOptionsData(symbol);
      const flowAnalysis = this.analyzeFlow(optionsData);
      const unusualActivity = this.detectUnusualActivity(optionsData);
      
      const aiAnalysis = await this.geminiService.generateContent(
        this.buildOptionsFlowPrompt(symbol, optionsData, flowAnalysis)
      );
      
      const optionsFlowResult = {
        symbol,
        data: optionsData,
        analysis: flowAnalysis,
        unusualActivity,
        aiInsights: aiAnalysis,
        signals: this.generateOptionsSignals(flowAnalysis, unusualActivity),
        timestamp: new Date().toISOString()
      };
      
      this.flowCache.set(symbol, optionsFlowResult);
      
      this.io.to(symbol).emit('optionsFlowUpdate', {
        symbol,
        optionsFlow: optionsFlowResult,
        timestamp: new Date().toISOString()
      });
      
      this.emit('optionsFlowAnalyzed', { symbol, optionsFlow: optionsFlowResult });
      
      return optionsFlowResult;
    } catch (error) {
      logger.error(\`OptionsFlowAnalyst: Failed to analyze \${symbol}:\`, error);
      throw error;
    }
  }

  analyzeFlow(optionsData) {
    const { chains, volume, openInterest } = optionsData;
    
    return {
      sentiment: this.calculateOptionsSentiment(volume),
      volumeAnalysis: this.analyzeVolume(volume),
      flowDirection: this.determineFlowDirection(chains),
      gammaExposure: this.calculateGammaExposure(chains),
      maxPain: this.calculateMaxPain(chains, openInterest),
      volatilitySkew: this.calculateVolatilitySkew(chains)
    };
  }

  calculateOptionsSentiment(volume) {
    const putCallRatio = volume.puts / volume.calls;
    
    let sentiment;
    if (putCallRatio > 1.2) sentiment = 'bearish';
    else if (putCallRatio < 0.8) sentiment = 'bullish';
    else sentiment = 'neutral';
    
    return {
      sentiment,
      putCallRatio,
      confidence: this.calculateSentimentConfidence(putCallRatio)
    };
  }

  analyzeVolume(volume) {
    const totalVolume = volume.calls + volume.puts;
    const averageVolume = volume.average || totalVolume;
    
    return {
      total: totalVolume,
      calls: volume.calls,
      puts: volume.puts,
      ratio: totalVolume / averageVolume,
      interpretation: totalVolume > averageVolume * 2 ? 'high' : 'normal'
    };
  }

  determineFlowDirection(chains) {
    // Analyze buying vs selling pressure
    let buyPressure = 0;
    let sellPressure = 0;
    
    chains.forEach(chain => {
      if (chain.type === 'call') {
        if (chain.bid > chain.ask * 0.9) buyPressure += chain.volume;
        else sellPressure += chain.volume;
      } else {
        if (chain.bid > chain.ask * 0.9) sellPressure += chain.volume;
        else buyPressure += chain.volume;
      }
    });
    
    return {
      buyPressure,
      sellPressure,
      netFlow: buyPressure - sellPressure,
      direction: buyPressure > sellPressure ? 'bullish' : 'bearish'
    };
  }

  calculateGammaExposure(chains) {
    let totalGamma = 0;
    let positiveGamma = 0;
    let negativeGamma = 0;
    
    chains.forEach(chain => {
      const gamma = chain.gamma || 0;
      totalGamma += Math.abs(gamma);
      
      if (gamma > 0) positiveGamma += gamma;
      else negativeGamma += Math.abs(gamma);
    });
    
    return {
      total: totalGamma,
      positive: positiveGamma,
      negative: negativeGamma,
      netGamma: positiveGamma - negativeGamma
    };
  }

  calculateMaxPain(chains, openInterest) {
    const strikes = {};
    
    chains.forEach(chain => {
      if (!strikes[chain.strike]) {
        strikes[chain.strike] = { calls: 0, puts: 0 };
      }
      
      if (chain.type === 'call') {
        strikes[chain.strike].calls += chain.openInterest || 0;
      } else {
        strikes[chain.strike].puts += chain.openInterest || 0;
      }
    });
    
    let maxPainStrike = null;
    let minPain = Infinity;
    
    Object.keys(strikes).forEach(strike => {
      const pain = this.calculatePainAtStrike(parseFloat(strike), strikes);
      if (pain < minPain) {
        minPain = pain;
        maxPainStrike = parseFloat(strike);
      }
    });
    
    return {
      strike: maxPainStrike,
      totalPain: minPain
    };
  }

  calculatePainAtStrike(strike, strikes) {
    let totalPain = 0;
    
    Object.keys(strikes).forEach(strikePrice => {
      const s = parseFloat(strikePrice);
      const { calls, puts } = strikes[strikePrice];
      
      if (strike > s) {
        totalPain += calls * (strike - s);
      }
      
      if (strike < s) {
        totalPain += puts * (s - strike);
      }
    });
    
    return totalPain;
  }

  calculateVolatilitySkew(chains) {
    const callIVs = chains.filter(c => c.type === 'call').map(c => c.impliedVolatility).filter(iv => iv);
    const putIVs = chains.filter(c => c.type === 'put').map(c => c.impliedVolatility).filter(iv => iv);
    
    const avgCallIV = callIVs.reduce((sum, iv) => sum + iv, 0) / callIVs.length || 0;
    const avgPutIV = putIVs.reduce((sum, iv) => sum + iv, 0) / putIVs.length || 0;
    
    return {
      callIV: avgCallIV,
      putIV: avgPutIV,
      skew: avgPutIV - avgCallIV
    };
  }

  detectUnusualActivity(optionsData) {
    const { chains, volume } = optionsData;
    const unusual = [];
    
    // Large individual trades
    chains.forEach(chain => {
      if (chain.volume > this.thresholds.largeTradeSize) {
        unusual.push({
          type: 'large_trade',
          contract: chain,
          significance: chain.volume / this.thresholds.largeTradeSize
        });
      }
    });
    
    // Unusual volume spikes
    if (volume.calls > volume.averageCalls * this.thresholds.unusualVolumeMultiplier) {
      unusual.push({
        type: 'unusual_call_volume',
        volume: volume.calls,
        significance: volume.calls / volume.averageCalls
      });
    }
    
    if (volume.puts > volume.averagePuts * this.thresholds.unusualVolumeMultiplier) {
      unusual.push({
        type: 'unusual_put_volume',
        volume: volume.puts,
        significance: volume.puts / volume.averagePuts
      });
    }
    
    return unusual;
  }

  generateOptionsSignals(analysis, unusualActivity) {
    const signals = [];
    
    // Sentiment-based signals
    if (analysis.sentiment.sentiment === 'bullish' && analysis.sentiment.confidence > 0.7) {
      signals.push({ type: 'BULLISH', source: 'OPTIONS_SENTIMENT', strength: 7 });
    } else if (analysis.sentiment.sentiment === 'bearish' && analysis.sentiment.confidence > 0.7) {
      signals.push({ type: 'BEARISH', source: 'OPTIONS_SENTIMENT', strength: 7 });
    }
    
    // Volume signals
    if (analysis.volumeAnalysis.interpretation === 'high') {
      signals.push({ type: 'HIGH_ACTIVITY', source: 'OPTIONS_VOLUME', strength: 6 });
    }
    
    // Unusual activity signals
    unusualActivity.forEach(activity => {
      if (activity.significance > 3) {
        signals.push({
          type: 'UNUSUAL_ACTIVITY',
          source: 'OPTIONS_FLOW',
          strength: Math.min(10, Math.floor(activity.significance)),
          details: activity
        });
      }
    });
    
    // Gamma exposure signals
    if (Math.abs(analysis.gammaExposure.netGamma) > this.thresholds.highGammaThreshold) {
      signals.push({
        type: analysis.gammaExposure.netGamma > 0 ? 'GAMMA_SQUEEZE_UP' : 'GAMMA_SQUEEZE_DOWN',
        source: 'GAMMA_EXPOSURE',
        strength: 8
      });
    }
    
    return signals;
  }

  buildOptionsFlowPrompt(symbol, data, analysis) {
    return \`
Analyze options flow for \${symbol}:

Volume Data:
- Call Volume: \${data.volume.calls}
- Put Volume: \${data.volume.puts}
- Put/Call Ratio: \${analysis.sentiment.putCallRatio.toFixed(2)}

Flow Analysis:
- Net Flow: \${analysis.flowDirection.netFlow}
- Direction: \${analysis.flowDirection.direction}
- Max Pain: $\${analysis.maxPain.strike}

Gamma Exposure:
- Net Gamma: \${analysis.gammaExposure.netGamma.toFixed(4)}
- Total Gamma: \${analysis.gammaExposure.total.toFixed(4)}

Provide insights on:
1. Institutional vs retail activity
2. Hedging implications
3. Market maker positioning
4. Volatility expectations
5. Key levels to watch
\`;
  }

  calculateSentimentConfidence(putCallRatio) {
    // Confidence based on how far from neutral (1.0) the ratio is
    const deviation = Math.abs(putCallRatio - 1.0);
    return Math.min(1.0, deviation * 2);
  }

  async fetchOptionsData(symbol) {
    // Mock implementation - replace with real options data API
    const mockChains = [];
    const strikes = [140, 145, 150, 155, 160, 165, 170];
    
    strikes.forEach(strike => {
      // Calls
      mockChains.push({
        type: 'call',
        strike,
        bid: Math.random() * 10 + 1,
        ask: Math.random() * 10 + 2,
        volume: Math.floor(Math.random() * 1000),
        openInterest: Math.floor(Math.random() * 5000),
        impliedVolatility: Math.random() * 0.5 + 0.2,
        gamma: Math.random() * 0.1
      });
      
      // Puts
      mockChains.push({
        type: 'put',
        strike,
        bid: Math.random() * 10 + 1,
        ask: Math.random() * 10 + 2,
        volume: Math.floor(Math.random() * 800),
        openInterest: Math.floor(Math.random() * 4000),
        impliedVolatility: Math.random() * 0.6 + 0.25,
        gamma: Math.random() * 0.1
      });
    });
    
    const callVolume = mockChains.filter(c => c.type === 'call').reduce((sum, c) => sum + c.volume, 0);
    const putVolume = mockChains.filter(c => c.type === 'put').reduce((sum, c) => sum + c.volume, 0);
    
    return {
      chains: mockChains,
      volume: {
        calls: callVolume,
        puts: putVolume,
        averageCalls: callVolume * 0.8,
        averagePuts: putVolume * 0.9
      },
      openInterest: {
        total: mockChains.reduce((sum, c) => sum + c.openInterest, 0)
      }
    };
  }

  getOptionsFlow(symbol) {
    return this.flowCache.get(symbol);
  }

  addToWatchlist(symbol) {
    if (!this.watchlist.includes(symbol)) {
      this.watchlist.push(symbol);
      logger.info(\`OptionsFlowAnalyst: Added \${symbol} to watchlist\`);
    }
  }

  removeFromWatchlist(symbol) {
    const index = this.watchlist.indexOf(symbol);
    if (index > -1) {
      this.watchlist.splice(index, 1);
      logger.info(\`OptionsFlowAnalyst: Removed \${symbol} from watchlist\`);
    }
  }

  isRunning() {
    return this.running;
  }
}

module.exports = OptionsFlowAnalyst;`;

    this.writeFile('src/agents/OptionsFlowAnalyst.js', optionsFlowAnalyst);
    this.log('✅ Created OptionsFlowAnalyst.js');
  }

  writeFile(filePath, content) {
    const fullPath = path.join(this.workspaceRoot, filePath);
    const dir = path.dirname(fullPath);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(fullPath, content);
  }
}

if (require.main === module) {
  const agent = new AgentEven();
  agent.start().catch(console.error);
}

module.exports = AgentEven;