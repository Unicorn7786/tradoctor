# Multi-Agent Trading System

A sophisticated trading agent system that combines technical analysis, sentiment analysis, options flow analysis, and fundamental analysis to provide comprehensive trading recommendations.

## System Architecture

### Agents
1. **Technical Analyst** - Analyzes technical indicators (200 MA, MACD, RSI) and call option flows
2. **Sentiment Analyst** - Monitors web sentiment and news sources
3. **Options Flow Analyst** - Analyzes options flow and order book data
4. **Valuation Analyst** - Performs fundamental analysis
5. **Trader Agent** - Consolidates all analyses and makes final recommendations

### Features
- Real-time market data analysis
- Multi-source sentiment monitoring
- Options flow tracking
- Fundamental analysis
- SMS notifications for trading signals
- Cloud deployment ready
- Scalable microservices architecture

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your API keys
```

3. Start the system:
```bash
npm start
```

## Configuration

### Required API Keys
- Alpha Vantage (market data)
- Finnhub (options flow)
- Twitter API (sentiment)
- Reddit API (sentiment)
- Twilio (SMS notifications)

### Environment Variables
See `.env.example` for all required environment variables.

## Deployment

The system is designed for cloud deployment with:
- Docker containerization
- PM2 process management
- Redis for caching and message queuing
- MongoDB for data persistence

## API Endpoints

- `GET /api/analysis/:symbol` - Get comprehensive analysis for a symbol
- `POST /api/watchlist` - Add symbols to watchlist
- `GET /api/signals` - Get latest trading signals
- `POST /api/notifications` - Configure notification preferences

## License

MIT 