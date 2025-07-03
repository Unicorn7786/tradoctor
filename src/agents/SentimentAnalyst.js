const EventEmitter = require('events');
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
        logger.error(`SentimentAnalyst: Error analyzing ${symbol}:`, error);
      }
    }
  }

  async analyzeSentiment(symbol) {
    logger.info(`SentimentAnalyst: Analyzing sentiment for ${symbol}`);
    
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
      logger.error(`SentimentAnalyst: Failed to analyze ${symbol}:`, error);
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
      const prompt = `
Analyze sentiment data for ${symbol}:

${sentimentData.map(data => `
Source: ${data.source}
Posts: ${data.posts}
Score: ${data.sentiment.score}
Positive: ${data.sentiment.positive}
Negative: ${data.sentiment.negative}
`).join('\n')}

Provide enhanced sentiment analysis including:
1. Market sentiment interpretation
2. Key themes and concerns
3. Sentiment momentum
4. Contrarian indicators
5. Overall sentiment rating (1-10)
`;

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
      { title: `${symbol} earnings looking strong`, text: 'Positive outlook' },
      { title: `Concerned about ${symbol} valuation`, text: 'Overvalued concerns' }
    ];
  }

  async fetchTweets(symbol) {
    // Mock implementation
    return [
      { text: `${symbol} to the moon! 🚀` },
      { text: `${symbol} looking bearish today` }
    ];
  }

  async fetchNewsArticles(symbol) {
    // Mock implementation
    return [
      { title: `${symbol} reports strong quarterly results`, text: 'Revenue growth...' }
    ];
  }

  async fetchFinancialNews(symbol) {
    // Mock implementation
    return [
      { title: `Analysts upgrade ${symbol} target price`, text: 'Price target raised...' }
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
      logger.info(`SentimentAnalyst: Added ${symbol} to watchlist`);
    }
  }

  removeFromWatchlist(symbol) {
    const index = this.watchlist.indexOf(symbol);
    if (index > -1) {
      this.watchlist.splice(index, 1);
      logger.info(`SentimentAnalyst: Removed ${symbol} from watchlist`);
    }
  }

  isRunning() {
    return this.running;
  }
}

module.exports = SentimentAnalyst;