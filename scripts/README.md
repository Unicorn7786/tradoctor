# Multi-Agent Development System

This directory contains the automated development agents that work in parallel to build out the trading system by splitting tasks between odd and even numbered tasks.

## System Overview

- **Agent Odd**: Handles odd-numbered tasks (1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35, 37, 39)
- **Agent Even**: Handles even-numbered tasks (2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38)
- **Coordinator**: Manages both agents, monitors their progress, and handles restarts

## Quick Start

### Start Both Agents
```bash
# Start agents in parallel
node scripts/start-agents.js start

# Start agents with REST API for monitoring
node scripts/start-agents.js start --api
```

### Check Status
```bash
node scripts/start-agents.js status
```

### Manual Agent Testing
```bash
# Test Agent Odd only
node scripts/agent-odd.js

# Test Agent Even only
node scripts/agent-even.js
```

## Task Distribution

The 39 tasks are automatically distributed between the two agents based on task number parity:

### Agent Odd Tasks
- **Task 7**: Integrate Gemini API for technical analysis
- **Task 9**: Implement Sentiment Analyst agent core logic
- **Task 11**: Write unit tests for Sentiment Analyst agent
- **Task 13**: Integrate options flow data sources
- **Task 15**: Implement Valuation Analyst agent core logic
- **Task 17**: Write unit tests for Valuation Analyst agent
- **Task 19**: Integrate Google Agent SDK for agent coordination
- **Task 21**: Build REST API endpoints
- **Task 23**: Write integration tests for API endpoints
- **Task 25**: Implement email notification system
- **Task 27**: Set up Docker Compose for local development
- **Task 29**: Write deployment documentation
- **Task 31**: Set up Grafana dashboards
- **Task 33**: Final code review and refactoring
- **Task 35**: Final end-to-end tests and launch

### Agent Even Tasks
- **Task 6**: Implement Technical Analyst agent core logic
- **Task 8**: Write unit tests for Technical Analyst agent
- **Task 10**: Integrate Gemini and LangChain for sentiment analysis
- **Task 12**: Implement Options Flow Analyst agent core logic
- **Task 14**: Write unit tests for Options Flow Analyst agent
- **Task 16**: Integrate Gemini for fundamental analysis
- **Task 18**: Implement Trader Agent orchestration logic
- **Task 20**: Write unit tests for Trader Agent
- **Task 22**: Implement WebSocket for real-time updates
- **Task 24**: Set up Twilio SMS notifications
- **Task 26**: Write tests for notification system
- **Task 28**: Set up PM2 for process management
- **Task 30**: Set up Prometheus monitoring
- **Task 32**: Set up ELK stack for logging
- **Task 34**: Prepare for production deployment
- **Task 36**: Final end-to-end tests and launch
- **Task 38**: Production deployment preparation

## Monitoring and Control

### REST API Endpoints (when started with --api)

The coordinator starts a REST API on port 3001 for monitoring:

```bash
# Check system status
curl http://localhost:3001/status

# Send command to specific agent
curl -X POST http://localhost:3001/agents/odd/command \
  -H "Content-Type: application/json" \
  -d '{"command": "pause", "data": {}}'

# Restart specific agent
curl -X POST http://localhost:3001/restart/even
```

### Log Files

Logs are automatically created in the `logs/` directory:
- `coordinator.log` - Coordinator activity
- `agent-odd.log` - Agent Odd activities
- `agent-even.log` - Agent Even activities
- `combined.log` - All system logs

### Agent Communication

Agents communicate with the coordinator via IPC messages:
- `task_started` - When an agent begins a task
- `task_completed` - When an agent completes a task
- `task_failed` - When an agent fails a task
- `status_update` - General status updates

## Development Workflow

1. **Start the system**: `node scripts/start-agents.js start --api`
2. **Monitor progress**: Check logs or use the REST API
3. **Handle failures**: Agents auto-restart on failure
4. **Manual intervention**: Use REST API to send commands or restart specific agents

## Task Implementation

Each agent automatically implements tasks based on their assigned numbers. Tasks include:

- Creating agent classes with full functionality
- Implementing AI integrations (Gemini, LangChain)
- Setting up data sources and APIs
- Creating comprehensive tests
- Setting up deployment infrastructure
- Implementing monitoring and logging

## Error Handling

- **Auto-restart**: Failed agents are automatically restarted
- **Graceful shutdown**: SIGTERM/SIGINT handling for clean shutdowns
- **Error logging**: All errors are captured in separate log files
- **Status monitoring**: Real-time status updates via API

## Dependencies

The agents automatically create all necessary:
- Directory structures
- Service classes
- Agent implementations
- Test files
- Configuration files
- Documentation

## Progress Tracking

Task completion is tracked in:
- `PROJECT_TASKS.md` - Master task list with status
- Agent logs - Detailed implementation progress
- Coordinator API - Real-time status

## Next Steps

1. Start the agents: `node scripts/start-agents.js start --api`
2. Monitor at: `http://localhost:3001/status`
3. Watch the parallel development unfold!

The agents will work continuously to implement all 39 tasks in parallel, automatically handling dependencies and coordination between odd and even numbered tasks.