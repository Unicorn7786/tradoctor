const { GoogleGenerativeAI } = require('@google/generative-ai');
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
    
    const prompt = `
Analyze the following technical indicators for ${symbol}:

Moving Averages:
- 50 MA: ${indicators.ma50}
- 200 MA: ${indicators.ma200}
- Current Price: ${indicators.currentPrice}

MACD:
- MACD Line: ${indicators.macd.macdLine}
- Signal Line: ${indicators.macd.signalLine}
- Histogram: ${indicators.macd.histogram}

RSI: ${indicators.rsi}

Volume Analysis:
- Current Volume: ${indicators.volume.current}
- Average Volume: ${indicators.volume.average}
- Volume Ratio: ${indicators.volume.ratio}

Options Flow:
- Call Volume: ${indicators.options.callVolume}
- Put Volume: ${indicators.options.putVolume}
- Put/Call Ratio: ${indicators.options.putCallRatio}

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
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const analysis = response.text();
      
      logger.info(`Technical analysis completed for ${symbol}`);
      return this.parseAnalysisResponse(analysis);
    } catch (error) {
      logger.error('Gemini technical analysis error:', error);
      throw error;
    }
  }

  async analyzeOptionsFlow(symbol, optionsData) {
    await this.rateLimit();
    
    const prompt = `
Analyze the options flow data for ${symbol}:

Options Activity:
- Total Volume: ${optionsData.totalVolume}
- Call Volume: ${optionsData.callVolume}
- Put Volume: ${optionsData.putVolume}
- Put/Call Ratio: ${optionsData.putCallRatio}

Unusual Activity:
- Large Trades: ${JSON.stringify(optionsData.largeTrades)}
- High Gamma Positions: ${JSON.stringify(optionsData.highGamma)}
- Max Pain Level: ${optionsData.maxPain}

Open Interest:
- Total OI: ${optionsData.openInterest.total}
- Call OI: ${optionsData.openInterest.calls}
- Put OI: ${optionsData.openInterest.puts}

Provide analysis on:
1. Institutional vs retail sentiment
2. Hedging vs directional activity
3. Gamma exposure implications
4. Volatility expectations
5. Key strike levels to watch
6. Options flow signal strength (1-10)

Return structured JSON analysis.
`;

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
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || 
                       response.match(/```\n([\s\S]*?)\n```/) ||
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

module.exports = GeminiTechnicalAnalysisService;