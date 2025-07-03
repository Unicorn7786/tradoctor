#!/usr/bin/env node

/**
 * Agent Odd - Development Agent for Odd-numbered Tasks
 * Handles tasks: 1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35, 37, 39
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

class AgentOdd {
  constructor() {
    this.name = 'Agent Odd';
    this.tasks = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35, 37, 39];
    this.currentTask = null;
    this.completedTasks = [];
    this.workspaceRoot = path.resolve(__dirname, '..');
  }

  log(message) {
    console.log(`[${this.name}] ${new Date().toISOString()} - ${message}`);
  }

  async start() {
    this.log('Starting development agent for odd-numbered tasks...');
    
    // Start with the next available odd task
    const nextTask = this.getNextTask();
    if (nextTask) {
      await this.executeTask(nextTask);
    } else {
      this.log('All odd-numbered tasks completed!');
    }
  }

  getNextTask() {
    // Check which tasks are not yet completed
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
      case 7:
        await this.task7_IntegrateGeminiForTechnicalAnalysis();
        break;
      case 9:
        await this.task9_ImplementSentimentAnalyst();
        break;
      case 11:
        await this.task11_SentimentAnalystTests();
        break;
      case 13:
        await this.task13_IntegrateOptionsFlowDataSources();
        break;
      case 15:
        await this.task15_ImplementValuationAnalyst();
        break;
      case 17:
        await this.task17_ValuationAnalystTests();
        break;
      case 19:
        await this.task19_IntegrateGoogleAgentSDK();
        break;
      case 21:
        await this.task21_BuildRESTAPI();
        break;
      case 23:
        await this.task23_APIIntegrationTests();
        break;
      case 25:
        await this.task25_EmailNotificationSystem();
        break;
      case 27:
        await this.task27_DockerCompose();
        break;
      case 29:
        await this.task29_DeploymentDocumentation();
        break;
      case 31:
        await this.task31_GrafanaDashboards();
        break;
      case 33:
        await this.task33_CodeReviewRefactoring();
        break;
      case 35:
        await this.task35_EndToEndTests();
        break;
      default:
        this.log(`Task ${taskNum} implementation not yet defined`);
    }

    this.completedTasks.push(taskNum);
    this.log(`Completed Task ${taskNum}`);
    
    // Move to next task
    const nextTask = this.getNextTask();
    if (nextTask) {
      setTimeout(() => this.executeTask(nextTask), 1000);
    }
  }

  async task7_IntegrateGeminiForTechnicalAnalysis() {
    this.log('Implementing Gemini API integration for technical analysis...');
    
    // Create enhanced Gemini service with technical analysis capabilities
    const geminiTechnicalService = `const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../utils/logger');

class GeminiTechnicalAnalysisService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro",
      generationConfig: {
        temperature: 0.1,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    });
    this.requestCount = 0;
    this.lastRequestTime = 0;
  }

  async analyzeTechnicalIndicators(symbol, indicators) {
    await this.rateLimit();
    
    const prompt = \`
Analyze the following technical indicators for \${symbol}:

Moving Averages:
- 50 MA: \${indicators.ma50}
- 200 MA: \${indicators.ma200}
- Current Price: \${indicators.currentPrice}

MACD:
- MACD Line: \${indicators.macd.macdLine}
- Signal Line: \${indicators.macd.signalLine}
- Histogram: \${indicators.macd.histogram}

RSI: \${indicators.rsi}

Volume Analysis:
- Current Volume: \${indicators.volume.current}
- Average Volume: \${indicators.volume.average}
- Volume Ratio: \${indicators.volume.ratio}

Options Flow:
- Call Volume: \${indicators.options.callVolume}
- Put Volume: \${indicators.options.putVolume}
- Put/Call Ratio: \${indicators.options.putCallRatio}

Please provide:
1. Technical trend analysis (bullish/bearish/neutral)
2. Key support and resistance levels
3. Momentum indicators interpretation
4. Volume confirmation analysis
5. Options flow implications
6. Overall technical rating (1-10 scale)
7. Specific entry/exit recommendations
8. Risk assessment

Format response as JSON with structured analysis.
\`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const analysis = response.text();
      
      logger.info(\`Technical analysis completed for \${symbol}\`);
      return this.parseAnalysisResponse(analysis);
    } catch (error) {
      logger.error('Gemini technical analysis error:', error);
      throw error;
    }
  }

  async analyzeOptionsFlow(symbol, optionsData) {
    await this.rateLimit();
    
    const prompt = \`
Analyze the options flow data for \${symbol}:

Options Activity:
- Total Volume: \${optionsData.totalVolume}
- Call Volume: \${optionsData.callVolume}
- Put Volume: \${optionsData.putVolume}
- Put/Call Ratio: \${optionsData.putCallRatio}

Unusual Activity:
- Large Trades: \${JSON.stringify(optionsData.largeTrades)}
- High Gamma Positions: \${JSON.stringify(optionsData.highGamma)}
- Max Pain Level: \${optionsData.maxPain}

Open Interest:
- Total OI: \${optionsData.openInterest.total}
- Call OI: \${optionsData.openInterest.calls}
- Put OI: \${optionsData.openInterest.puts}

Provide analysis on:
1. Institutional vs retail sentiment
2. Hedging vs directional activity
3. Gamma exposure implications
4. Volatility expectations
5. Key strike levels to watch
6. Options flow signal strength (1-10)

Return structured JSON analysis.
\`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const analysis = response.text();
      
      return this.parseAnalysisResponse(analysis);
    } catch (error) {
      logger.error('Options flow analysis error:', error);
      throw error;
    }
  }

  parseAnalysisResponse(response) {
    try {
      // Extract JSON from response if wrapped in markdown
      const jsonMatch = response.match(/\`\`\`json\\n([\\s\\S]*?)\\n\`\`\`/) || 
                       response.match(/\`\`\`\\n([\\s\\S]*?)\\n\`\`\`/) ||
                       [null, response];
      
      const jsonStr = jsonMatch[1] || response;
      return JSON.parse(jsonStr);
    } catch (error) {
      logger.warn('Failed to parse JSON response, returning raw text');
      return { analysis: response, parsed: false };
    }
  }

  async rateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    // Gemini allows 60 requests per minute
    const minInterval = 1000; // 1 second between requests
    
    if (timeSinceLastRequest < minInterval) {
      const waitTime = minInterval - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.requestCount++;
    this.lastRequestTime = Date.now();
  }

  getUsageStats() {
    return {
      requestCount: this.requestCount,
      lastRequestTime: this.lastRequestTime
    };
  }
}

module.exports = GeminiTechnicalAnalysisService;`;

    this.writeFile('src/services/GeminiTechnicalAnalysisService.js', geminiTechnicalService);
    this.log('✅ Created GeminiTechnicalAnalysisService.js');
  }

  async task9_ImplementSentimentAnalyst() {
    this.log('Implementing Sentiment Analyst agent core logic...');
    
    const sentimentAnalyst = `const EventEmitter = require('events');
const axios = require('axios');
const natural = require('natural');
const sentiment = require('sentiment');
const logger = require('../utils/logger');
const GeminiService = require('../services/GeminiService');

class SentimentAnalyst extends EventEmitter {
  constructor(io) {
    super();
    this.io = io;
    this.running = false;
    this.watchlist = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'];
    this.sentimentCache = new Map();
    this.geminiService = new GeminiService();
    this.analyzer = new sentiment();
    
    // Sentiment data sources
    this.sources = {
      reddit: true,
      twitter: true, 
      news: true,
      financialNews: true
    };
    
    this.sentimentHistory = new Map();
    this.updateInterval = 5 * 60 * 1000; // 5 minutes
  }

  async start() {
    if (this.running) return;
    
    this.running = true;
    logger.info('SentimentAnalyst: Starting sentiment analysis agent');
    
    // Initial sentiment analysis
    await this.analyzeSentimentForWatchlist();
    
    // Set up periodic updates
    this.intervalId = setInterval(() => {
      this.analyzeSentimentForWatchlist();
    }, this.updateInterval);
    
    this.emit('started');
  }

  async stop() {
    if (!this.running) return;
    
    this.running = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    
    logger.info('SentimentAnalyst: Stopped');
    this.emit('stopped');
  }

  async analyzeSentimentForWatchlist() {
    for (const symbol of this.watchlist) {
      try {
        await this.analyzeSentiment(symbol);
      } catch (error) {
        logger.error(\`SentimentAnalyst: Error analyzing \${symbol}:\`, error);
      }
    }
  }

  async analyzeSentiment(symbol) {
    logger.info(\`SentimentAnalyst: Analyzing sentiment for \${symbol}\`);
    
    try {
      // Gather sentiment data from multiple sources
      const sentimentData = await this.gatherSentimentData(symbol);
      
      // Process and score sentiment
      const sentimentScore = await this.processSentimentData(symbol, sentimentData);
      
      // Store in cache and history
      this.sentimentCache.set(symbol, sentimentScore);
      this.updateSentimentHistory(symbol, sentimentScore);
      
      // Emit real-time update
      this.io.to(symbol).emit('sentimentUpdate', {
        symbol,
        sentiment: sentimentScore,
        timestamp: new Date().toISOString()
      });
      
      this.emit('sentimentAnalyzed', { symbol, sentiment: sentimentScore });
      
      return sentimentScore;
    } catch (error) {
      logger.error(\`SentimentAnalyst: Failed to analyze \${symbol}:\`, error);
      throw error;
    }
  }

  async gatherSentimentData(symbol) {
    const promises = [];
    
    if (this.sources.reddit) {
      promises.push(this.getRedditSentiment(symbol));
    }
    
    if (this.sources.twitter) {
      promises.push(this.getTwitterSentiment(symbol));
    }
    
    if (this.sources.news) {
      promises.push(this.getNewsSentiment(symbol));
    }
    
    if (this.sources.financialNews) {
      promises.push(this.getFinancialNewsSentiment(symbol));
    }
    
    const results = await Promise.allSettled(promises);
    
    return results
      .filter(result => result.status === 'fulfilled')
      .map(result => result.value)
      .filter(data => data);
  }

  async getRedditSentiment(symbol) {
    try {
      // Simulate Reddit API call (replace with actual API)
      const subreddits = ['investing', 'stocks', 'SecurityAnalysis', 'ValueInvesting'];
      const posts = await this.fetchRedditPosts(symbol, subreddits);
      
      return {
        source: 'reddit',
        posts: posts.length,
        sentiment: this.analyzePosts(posts),
        weight: 0.25
      };
    } catch (error) {
      logger.warn('Reddit sentiment fetch failed:', error);
      return null;
    }
  }

  async getTwitterSentiment(symbol) {
    try {
      // Simulate Twitter API call (replace with actual API)
      const tweets = await this.fetchTweets(symbol);
      
      return {
        source: 'twitter',
        posts: tweets.length,
        sentiment: this.analyzePosts(tweets),
        weight: 0.3
      };
    } catch (error) {
      logger.warn('Twitter sentiment fetch failed:', error);
      return null;
    }
  }

  async getNewsSentiment(symbol) {
    try {
      const newsArticles = await this.fetchNewsArticles(symbol);
      
      return {
        source: 'news',
        posts: newsArticles.length,
        sentiment: this.analyzeArticles(newsArticles),
        weight: 0.3
      };
    } catch (error) {
      logger.warn('News sentiment fetch failed:', error);
      return null;
    }
  }

  async getFinancialNewsSentiment(symbol) {
    try {
      const finNews = await this.fetchFinancialNews(symbol);
      
      return {
        source: 'financial_news',
        posts: finNews.length,
        sentiment: this.analyzeArticles(finNews),
        weight: 0.15
      };
    } catch (error) {
      logger.warn('Financial news sentiment fetch failed:', error);
      return null;
    }
  }

  async processSentimentData(symbol, sentimentData) {
    // Calculate weighted sentiment score
    let totalWeight = 0;
    let weightedScore = 0;
    
    sentimentData.forEach(data => {
      if (data && data.sentiment) {
        weightedScore += data.sentiment.score * data.weight;
        totalWeight += data.weight;
      }
    });
    
    const aggregatedScore = totalWeight > 0 ? weightedScore / totalWeight : 0;
    
    // Enhanced analysis with Gemini
    const aiAnalysis = await this.getAIEnhancedAnalysis(symbol, sentimentData);
    
    return {
      symbol,
      overallScore: aggregatedScore,
      sentiment: this.classifySentiment(aggregatedScore),
      sources: sentimentData.length,
      breakdown: sentimentData,
      aiInsights: aiAnalysis,
      confidence: this.calculateConfidence(sentimentData),
      timestamp: new Date().toISOString()
    };
  }

  analyzePosts(posts) {
    if (!posts || posts.length === 0) {
      return { score: 0, positive: 0, negative: 0, neutral: 0 };
    }
    
    let totalScore = 0;
    let positive = 0;
    let negative = 0;
    let neutral = 0;
    
    posts.forEach(post => {
      const result = this.analyzer.analyze(post.text || post.title || '');
      totalScore += result.score;
      
      if (result.score > 0) positive++;
      else if (result.score < 0) negative++;
      else neutral++;
    });
    
    return {
      score: totalScore / posts.length,
      positive,
      negative,
      neutral,
      total: posts.length
    };
  }

  analyzeArticles(articles) {
    return this.analyzePosts(articles);
  }

  async getAIEnhancedAnalysis(symbol, sentimentData) {
    try {
      const prompt = \`
Analyze sentiment data for \${symbol}:

\${sentimentData.map(data => \`
Source: \${data.source}
Posts: \${data.posts}
Score: \${data.sentiment.score}
Positive: \${data.sentiment.positive}
Negative: \${data.sentiment.negative}
\`).join('\\n')}

Provide enhanced sentiment analysis including:
1. Market sentiment interpretation
2. Key themes and concerns
3. Sentiment momentum
4. Contrarian indicators
5. Overall sentiment rating (1-10)
\`;

      return await this.geminiService.generateContent(prompt);
    } catch (error) {
      logger.warn('AI sentiment analysis failed:', error);
      return null;
    }
  }

  // Mock data fetching methods (replace with actual APIs)
  async fetchRedditPosts(symbol, subreddits) {
    // Mock implementation
    return [
      { title: \`\${symbol} earnings looking strong\`, text: 'Positive outlook' },
      { title: \`Concerned about \${symbol} valuation\`, text: 'Overvalued concerns' }
    ];
  }

  async fetchTweets(symbol) {
    // Mock implementation
    return [
      { text: \`\${symbol} to the moon! 🚀\` },
      { text: \`\${symbol} looking bearish today\` }
    ];
  }

  async fetchNewsArticles(symbol) {
    // Mock implementation
    return [
      { title: \`\${symbol} reports strong quarterly results\`, text: 'Revenue growth...' }
    ];
  }

  async fetchFinancialNews(symbol) {
    // Mock implementation
    return [
      { title: \`Analysts upgrade \${symbol} target price\`, text: 'Price target raised...' }
    ];
  }

  classifySentiment(score) {
    if (score > 0.1) return 'bullish';
    if (score < -0.1) return 'bearish';
    return 'neutral';
  }

  calculateConfidence(sentimentData) {
    const sourceCount = sentimentData.length;
    const postCount = sentimentData.reduce((sum, data) => sum + (data.posts || 0), 0);
    
    // Confidence based on data quantity and source diversity
    let confidence = Math.min(sourceCount / 4, 1) * 0.5; // Source diversity
    confidence += Math.min(postCount / 100, 1) * 0.5; // Data quantity
    
    return Math.round(confidence * 100);
  }

  updateSentimentHistory(symbol, sentimentScore) {
    if (!this.sentimentHistory.has(symbol)) {
      this.sentimentHistory.set(symbol, []);
    }
    
    const history = this.sentimentHistory.get(symbol);
    history.push(sentimentScore);
    
    // Keep only last 100 entries
    if (history.length > 100) {
      history.shift();
    }
  }

  getSentiment(symbol) {
    return this.sentimentCache.get(symbol);
  }

  getSentimentHistory(symbol) {
    return this.sentimentHistory.get(symbol) || [];
  }

  addToWatchlist(symbol) {
    if (!this.watchlist.includes(symbol)) {
      this.watchlist.push(symbol);
      logger.info(\`SentimentAnalyst: Added \${symbol} to watchlist\`);
    }
  }

  removeFromWatchlist(symbol) {
    const index = this.watchlist.indexOf(symbol);
    if (index > -1) {
      this.watchlist.splice(index, 1);
      logger.info(\`SentimentAnalyst: Removed \${symbol} from watchlist\`);
    }
  }

  isRunning() {
    return this.running;
  }
}

module.exports = SentimentAnalyst;`;

    this.writeFile('src/agents/SentimentAnalyst.js', sentimentAnalyst);
    this.log('✅ Created SentimentAnalyst.js');
  }

  async task15_ImplementValuationAnalyst() {
    this.log('Implementing Valuation Analyst agent core logic...');
    
    const valuationAnalyst = `const EventEmitter = require('events');
const axios = require('axios');
const logger = require('../utils/logger');
const GeminiService = require('../services/GeminiService');

class ValuationAnalyst extends EventEmitter {
  constructor(io) {
    super();
    this.io = io;
    this.running = false;
    this.watchlist = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'];
    this.valuationCache = new Map();
    this.geminiService = new GeminiService();
    this.updateInterval = 4 * 60 * 60 * 1000; // 4 hours
    
    this.models = {
      dcf: true,
      comparable: true,
      graham: true,
      lynch: true
    };
  }

  async start() {
    if (this.running) return;
    
    this.running = true;
    logger.info('ValuationAnalyst: Starting fundamental analysis agent');
    
    // Initial valuation analysis
    await this.analyzeWatchlist();
    
    // Set up periodic updates
    this.intervalId = setInterval(() => {
      this.analyzeWatchlist();
    }, this.updateInterval);
    
    this.emit('started');
  }

  async stop() {
    if (!this.running) return;
    
    this.running = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    
    logger.info('ValuationAnalyst: Stopped');
    this.emit('stopped');
  }

  async analyzeWatchlist() {
    for (const symbol of this.watchlist) {
      try {
        await this.analyzeValuation(symbol);
      } catch (error) {
        logger.error(\`ValuationAnalyst: Error analyzing \${symbol}:\`, error);
      }
    }
  }

  async analyzeValuation(symbol) {
    logger.info(\`ValuationAnalyst: Analyzing valuation for \${symbol}\`);
    
    try {
      // Gather fundamental data
      const fundamentalData = await this.gatherFundamentalData(symbol);
      
      // Calculate valuation models
      const valuationModels = await this.calculateValuationModels(symbol, fundamentalData);
      
      // AI-enhanced analysis
      const aiAnalysis = await this.getAIValuationAnalysis(symbol, fundamentalData, valuationModels);
      
      const valuationResult = {
        symbol,
        fundamentals: fundamentalData,
        models: valuationModels,
        aiAnalysis,
        recommendation: this.generateRecommendation(valuationModels),
        riskFactors: this.assessRiskFactors(fundamentalData),
        timestamp: new Date().toISOString()
      };
      
      // Store in cache
      this.valuationCache.set(symbol, valuationResult);
      
      // Emit real-time update
      this.io.to(symbol).emit('valuationUpdate', {
        symbol,
        valuation: valuationResult,
        timestamp: new Date().toISOString()
      });
      
      this.emit('valuationAnalyzed', { symbol, valuation: valuationResult });
      
      return valuationResult;
    } catch (error) {
      logger.error(\`ValuationAnalyst: Failed to analyze \${symbol}:\`, error);
      throw error;
    }
  }

  async gatherFundamentalData(symbol) {
    // In production, fetch from multiple financial data APIs
    // This is a mock implementation
    return {
      profile: {
        marketCap: 2800000000000,
        employees: 164000,
        sector: 'Technology',
        industry: 'Consumer Electronics'
      },
      financials: {
        revenue: 394328000000,
        grossProfit: 169148000000,
        operatingIncome: 114301000000,
        netIncome: 99803000000,
        totalDebt: 109106000000,
        totalCash: 166016000000,
        shareholderEquity: 50672000000
      },
      ratios: {
        pe: 28.1,
        pb: 55.2,
        ps: 7.1,
        peg: 2.1,
        roe: 196.8,
        roa: 27.9,
        currentRatio: 1.0,
        debtToEquity: 2.15
      },
      metrics: {
        sharesOutstanding: 15552752000,
        bookValuePerShare: 3.26,
        earningsPerShare: 6.42,
        revenuePerShare: 25.35,
        dividendYield: 0.44
      },
      growth: {
        revenueGrowth5Y: 0.054,
        earningsGrowth5Y: 0.089,
        dividendGrowth5Y: 0.077
      }
    };
  }

  async calculateValuationModels(symbol, data) {
    const models = {};
    
    if (this.models.dcf) {
      models.dcf = this.calculateDCF(data);
    }
    
    if (this.models.comparable) {
      models.comparable = await this.calculateComparableValuation(symbol, data);
    }
    
    if (this.models.graham) {
      models.graham = this.calculateGrahamNumber(data);
    }
    
    if (this.models.lynch) {
      models.lynch = this.calculatePEGRatio(data);
    }
    
    return models;
  }

  calculateDCF(data) {
    // Simplified DCF model
    const { revenue, operatingIncome } = data.financials;
    const { revenueGrowth5Y } = data.growth;
    const { sharesOutstanding } = data.metrics;
    
    const wacc = 0.08; // Weighted Average Cost of Capital (8%)
    const terminalGrowthRate = 0.025; // 2.5% terminal growth
    const projectionYears = 5;
    
    let totalPV = 0;
    let fcf = operatingIncome * 0.85; // Approximate free cash flow
    
    // Project cash flows
    for (let year = 1; year <= projectionYears; year++) {
      fcf = fcf * (1 + revenueGrowth5Y);
      const pv = fcf / Math.pow(1 + wacc, year);
      totalPV += pv;
    }
    
    // Terminal value
    const terminalFCF = fcf * (1 + terminalGrowthRate);
    const terminalValue = terminalFCF / (wacc - terminalGrowthRate);
    const terminalPV = terminalValue / Math.pow(1 + wacc, projectionYears);
    
    const enterpriseValue = totalPV + terminalPV;
    const equityValue = enterpriseValue + data.financials.totalCash - data.financials.totalDebt;
    const fairValue = equityValue / sharesOutstanding;
    
    return {
      fairValue: Math.round(fairValue * 100) / 100,
      enterpriseValue,
      terminalValue,
      assumptions: {
        wacc,
        terminalGrowthRate,
        projectionYears
      }
    };
  }

  async calculateComparableValuation(symbol, data) {
    // Mock industry comparables
    const industryAvgPE = 25.3;
    const industryAvgPB = 6.8;
    const industryAvgPS = 5.2;
    
    const { earningsPerShare, bookValuePerShare, revenuePerShare } = data.metrics;
    
    return {
      peValuation: earningsPerShare * industryAvgPE,
      pbValuation: bookValuePerShare * industryAvgPB,
      psValuation: revenuePerShare * industryAvgPS,
      averageValuation: (
        (earningsPerShare * industryAvgPE) +
        (bookValuePerShare * industryAvgPB) +
        (revenuePerShare * industryAvgPS)
      ) / 3,
      industryMetrics: {
        avgPE: industryAvgPE,
        avgPB: industryAvgPB,
        avgPS: industryAvgPS
      }
    };
  }

  calculateGrahamNumber(data) {
    const { earningsPerShare, bookValuePerShare } = data.metrics;
    const grahamNumber = Math.sqrt(22.5 * earningsPerShare * bookValuePerShare);
    
    return {
      fairValue: Math.round(grahamNumber * 100) / 100,
      interpretation: grahamNumber > 0 ? 'Conservative value estimate' : 'Unable to calculate'
    };
  }

  calculatePEGRatio(data) {
    const { pe } = data.ratios;
    const { earningsGrowth5Y } = data.growth;
    
    const pegRatio = pe / (earningsGrowth5Y * 100);
    
    return {
      pegRatio: Math.round(pegRatio * 100) / 100,
      interpretation: pegRatio < 1 ? 'Undervalued' : pegRatio > 2 ? 'Overvalued' : 'Fair'
    };
  }

  async getAIValuationAnalysis(symbol, fundamentalData, valuationModels) {
    try {
      const prompt = \`
Analyze the fundamental valuation for \${symbol}:

Company Metrics:
- Market Cap: $\${(fundamentalData.profile.marketCap / 1000000000).toFixed(1)}B
- Revenue: $\${(fundamentalData.financials.revenue / 1000000000).toFixed(1)}B
- Net Income: $\${(fundamentalData.financials.netIncome / 1000000000).toFixed(1)}B
- P/E Ratio: \${fundamentalData.ratios.pe}
- ROE: \${fundamentalData.ratios.roe}%

Valuation Models:
- DCF Fair Value: $\${valuationModels.dcf?.fairValue || 'N/A'}
- Comparable Valuation: $\${valuationModels.comparable?.averageValuation?.toFixed(2) || 'N/A'}
- Graham Number: $\${valuationModels.graham?.fairValue || 'N/A'}
- PEG Ratio: \${valuationModels.lynch?.pegRatio || 'N/A'}

Growth Metrics:
- Revenue Growth (5Y): \${(fundamentalData.growth.revenueGrowth5Y * 100).toFixed(1)}%
- Earnings Growth (5Y): \${(fundamentalData.growth.earningsGrowth5Y * 100).toFixed(1)}%

Provide comprehensive analysis including:
1. Valuation summary (overvalued/fairly valued/undervalued)
2. Key value drivers and risks
3. Growth sustainability assessment
4. Financial health evaluation
5. Competitive position analysis
6. Investment recommendation with price targets
7. Risk-adjusted return expectations

Format as structured analysis.
\`;

      return await this.geminiService.generateContent(prompt);
    } catch (error) {
      logger.warn('AI valuation analysis failed:', error);
      return { error: 'AI analysis unavailable' };
    }
  }

  generateRecommendation(valuationModels) {
    const values = [];
    
    if (valuationModels.dcf?.fairValue) values.push(valuationModels.dcf.fairValue);
    if (valuationModels.comparable?.averageValuation) values.push(valuationModels.comparable.averageValuation);
    if (valuationModels.graham?.fairValue) values.push(valuationModels.graham.fairValue);
    
    if (values.length === 0) {
      return { action: 'HOLD', confidence: 'LOW', reason: 'Insufficient valuation data' };
    }
    
    const avgFairValue = values.reduce((sum, val) => sum + val, 0) / values.length;
    const currentPrice = 180; // Mock current price - replace with real data
    
    const upside = (avgFairValue - currentPrice) / currentPrice;
    
    let action, confidence;
    
    if (upside > 0.2) {
      action = 'BUY';
      confidence = upside > 0.4 ? 'HIGH' : 'MEDIUM';
    } else if (upside < -0.15) {
      action = 'SELL';
      confidence = upside < -0.3 ? 'HIGH' : 'MEDIUM';
    } else {
      action = 'HOLD';
      confidence = 'MEDIUM';
    }
    
    return {
      action,
      confidence,
      fairValue: Math.round(avgFairValue * 100) / 100,
      currentPrice,
      upside: Math.round(upside * 1000) / 10 + '%',
      reason: \`Based on \${values.length} valuation models\`
    };
  }

  assessRiskFactors(data) {
    const risks = [];
    
    // Debt analysis
    if (data.ratios.debtToEquity > 2) {
      risks.push({ type: 'HIGH_DEBT', severity: 'HIGH', description: 'High debt-to-equity ratio' });
    }
    
    // Valuation risk
    if (data.ratios.pe > 30) {
      risks.push({ type: 'HIGH_VALUATION', severity: 'MEDIUM', description: 'High P/E multiple' });
    }
    
    // Liquidity risk
    if (data.ratios.currentRatio < 1) {
      risks.push({ type: 'LIQUIDITY', severity: 'HIGH', description: 'Low current ratio' });
    }
    
    // Growth sustainability
    if (data.growth.revenueGrowth5Y < 0.02) {
      risks.push({ type: 'GROWTH', severity: 'MEDIUM', description: 'Low revenue growth' });
    }
    
    return risks;
  }

  getValuation(symbol) {
    return this.valuationCache.get(symbol);
  }

  addToWatchlist(symbol) {
    if (!this.watchlist.includes(symbol)) {
      this.watchlist.push(symbol);
      logger.info(\`ValuationAnalyst: Added \${symbol} to watchlist\`);
    }
  }

  removeFromWatchlist(symbol) {
    const index = this.watchlist.indexOf(symbol);
    if (index > -1) {
      this.watchlist.splice(index, 1);
      logger.info(\`ValuationAnalyst: Removed \${symbol} from watchlist\`);
    }
  }

  isRunning() {
    return this.running;
  }
}

module.exports = ValuationAnalyst;`;

    this.writeFile('src/agents/ValuationAnalyst.js', valuationAnalyst);
    this.log('✅ Created ValuationAnalyst.js');
  }

  writeFile(filePath, content) {
    const fullPath = path.join(this.workspaceRoot, filePath);
    const dir = path.dirname(fullPath);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(fullPath, content);
  }
}

// Start the agent
if (require.main === module) {
  const agent = new AgentOdd();
  agent.start().catch(console.error);
}

module.exports = AgentOdd;