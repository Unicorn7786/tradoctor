const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../utils/logger');

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-pro',
      generationConfig: {
        maxOutputTokens: parseInt(process.env.GEMINI_MAX_TOKENS) || 8192,
        temperature: parseFloat(process.env.GEMINI_TEMPERATURE) || 0.7,
      },
    });
    this.chat = this.model.startChat({
      history: [],
      generationConfig: {
        maxOutputTokens: parseInt(process.env.GEMINI_MAX_TOKENS) || 8192,
        temperature: parseFloat(process.env.GEMINI_TEMPERATURE) || 0.7,
      },
    });
  }

  async analyzeTechnicalData(symbol, technicalData) {
    try {
      const prompt = `
        Analyze the following technical data for ${symbol} and provide a comprehensive trading recommendation:
        
        Technical Indicators:
        - 200 Day Moving Average: ${technicalData.ma200}
        - Current Price: ${technicalData.currentPrice}
        - MACD: ${JSON.stringify(technicalData.macd)}
        - RSI: ${technicalData.rsi}
        - Volume: ${technicalData.volume}
        
        Please provide:
        1. Technical analysis summary
        2. Buy/Sell/Hold recommendation with confidence level (0-100%)
        3. Key support and resistance levels
        4. Risk assessment
        5. Short-term price targets
        
        Format your response as JSON with the following structure:
        {
          "analysis": "detailed technical analysis",
          "recommendation": "BUY/SELL/HOLD",
          "confidence": 85,
          "supportLevels": [100, 95, 90],
          "resistanceLevels": [110, 115, 120],
          "riskLevel": "LOW/MEDIUM/HIGH",
          "priceTargets": {
            "shortTerm": 110,
            "mediumTerm": 120,
            "longTerm": 130
          },
          "reasoning": "detailed reasoning for recommendation"
        }
      `;

      const result = await this.chat.sendMessage(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Try to parse JSON response
      try {
        return JSON.parse(text);
      } catch (parseError) {
        logger.warn('Failed to parse Gemini response as JSON, returning text:', parseError);
        return {
          analysis: text,
          recommendation: 'HOLD',
          confidence: 50,
          reasoning: text
        };
      }
    } catch (error) {
      logger.error('Error in Gemini technical analysis:', error);
      throw error;
    }
  }

  async analyzeSentiment(newsData, socialData) {
    try {
      const prompt = `
        Analyze the following sentiment data and provide a comprehensive sentiment analysis:
        
        News Headlines:
        ${newsData.map(item => `- ${item.headline} (${item.sentiment})`).join('\n')}
        
        Social Media Sentiment:
        ${socialData.map(item => `- ${item.platform}: ${item.sentiment} (${item.volume} mentions)`).join('\n')}
        
        Please provide:
        1. Overall sentiment score (-100 to +100)
        2. Sentiment trend (BULLISH/BEARISH/NEUTRAL)
        3. Key sentiment drivers
        4. Confidence in sentiment analysis
        5. Potential market impact
        
        Format your response as JSON:
        {
          "overallSentiment": 75,
          "sentimentTrend": "BULLISH",
          "confidence": 85,
          "keyDrivers": ["positive earnings", "product launch"],
          "marketImpact": "POSITIVE",
          "analysis": "detailed sentiment analysis"
        }
      `;

      const result = await this.chat.sendMessage(prompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        return JSON.parse(text);
      } catch (parseError) {
        logger.warn('Failed to parse Gemini sentiment response as JSON:', parseError);
        return {
          overallSentiment: 0,
          sentimentTrend: 'NEUTRAL',
          confidence: 50,
          analysis: text
        };
      }
    } catch (error) {
      logger.error('Error in Gemini sentiment analysis:', error);
      throw error;
    }
  }

  async analyzeOptionsFlow(optionsData) {
    try {
      const prompt = `
        Analyze the following options flow data and identify potential insider activity or upcoming news:
        
        Options Flow Data:
        ${JSON.stringify(optionsData, null, 2)}
        
        Please provide:
        1. Unusual options activity detection
        2. Potential insider trading indicators
        3. Upcoming news catalysts
        4. Options flow sentiment
        5. Risk assessment
        
        Format your response as JSON:
        {
          "unusualActivity": true,
          "insiderIndicators": ["large call purchases", "unusual put activity"],
          "potentialCatalysts": ["earnings announcement", "FDA approval"],
          "flowSentiment": "BULLISH",
          "riskLevel": "MEDIUM",
          "analysis": "detailed options flow analysis"
        }
      `;

      const result = await this.chat.sendMessage(prompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        return JSON.parse(text);
      } catch (parseError) {
        logger.warn('Failed to parse Gemini options flow response as JSON:', parseError);
        return {
          unusualActivity: false,
          flowSentiment: 'NEUTRAL',
          analysis: text
        };
      }
    } catch (error) {
      logger.error('Error in Gemini options flow analysis:', error);
      throw error;
    }
  }

  async generateTradingRecommendation(technicalAnalysis, sentimentAnalysis, optionsAnalysis, fundamentalAnalysis) {
    try {
      const prompt = `
        As a senior trading analyst, synthesize the following analyses into a final trading recommendation:
        
        Technical Analysis: ${JSON.stringify(technicalAnalysis)}
        Sentiment Analysis: ${JSON.stringify(sentimentAnalysis)}
        Options Flow Analysis: ${JSON.stringify(optionsAnalysis)}
        Fundamental Analysis: ${JSON.stringify(fundamentalAnalysis)}
        
        Please provide a comprehensive trading recommendation that considers all factors:
        
        Format your response as JSON:
        {
          "finalRecommendation": "STRONG_BUY/BUY/HOLD/SELL/STRONG_SELL",
          "confidence": 85,
          "riskLevel": "LOW/MEDIUM/HIGH",
          "timeHorizon": "SHORT_TERM/MEDIUM_TERM/LONG_TERM",
          "priceTarget": 150,
          "stopLoss": 120,
          "keyFactors": ["technical breakout", "positive sentiment", "insider buying"],
          "risks": ["market volatility", "earnings risk"],
          "summary": "comprehensive summary of recommendation",
          "actionItems": ["buy at market", "set stop loss at 120", "monitor earnings"]
        }
      `;

      const result = await this.chat.sendMessage(prompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        return JSON.parse(text);
      } catch (parseError) {
        logger.warn('Failed to parse Gemini trading recommendation as JSON:', parseError);
        return {
          finalRecommendation: 'HOLD',
          confidence: 50,
          summary: text
        };
      }
    } catch (error) {
      logger.error('Error in Gemini trading recommendation generation:', error);
      throw error;
    }
  }

  async generateSMSText(recommendation) {
    try {
      const prompt = `
        Convert this trading recommendation into a concise SMS message (max 160 characters):
        
        ${JSON.stringify(recommendation)}
        
        Include:
        - Symbol
        - Action (BUY/SELL/HOLD)
        - Key reason
        - Price target if available
        
        Keep it professional and actionable.
      `;

      const result = await this.chat.sendMessage(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      logger.error('Error generating SMS text:', error);
      return `Trading Signal: ${recommendation.finalRecommendation} - ${recommendation.summary}`;
    }
  }
}

module.exports = GeminiService; 