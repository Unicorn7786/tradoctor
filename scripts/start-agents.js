#!/usr/bin/env node

/**
 * Multi-Agent Development Coordinator
 * Starts and manages both Agent Odd and Agent Even for parallel development
 */

const { spawn, fork } = require('child_process');
const path = require('path');
const fs = require('fs');

class AgentCoordinator {
  constructor() {
    this.agents = {
      odd: null,
      even: null
    };
    this.status = {
      odd: 'stopped',
      even: 'stopped'
    };
    this.logs = {
      odd: [],
      even: []
    };
    this.workspaceRoot = path.resolve(__dirname, '..');
  }

  log(message) {
    console.log(`[Coordinator] ${new Date().toISOString()} - ${message}`);
  }

  async start() {
    this.log('🚀 Starting Multi-Agent Development System');
    this.log('📋 Task Distribution:');
    this.log('   Agent Odd: Tasks 1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35, 37, 39');
    this.log('   Agent Even: Tasks 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38');
    
    // Ensure directories exist
    this.ensureDirectories();
    
    // Start both agents in parallel
    await Promise.all([
      this.startAgent('odd'),
      this.startAgent('even')
    ]);
    
    // Monitor agents
    this.monitorAgents();
    
    // Setup graceful shutdown
    this.setupShutdown();
  }

  ensureDirectories() {
    const dirs = [
      'src/agents',
      'src/services',
      'src/utils',
      'src/routes',
      'src/middleware',
      'tests',
      'logs',
      'scripts'
    ];

    dirs.forEach(dir => {
      const fullPath = path.join(this.workspaceRoot, dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        this.log(`📁 Created directory: ${dir}`);
      }
    });
  }

  async startAgent(type) {
    const agentPath = path.join(__dirname, `agent-${type}.js`);
    
    if (!fs.existsSync(agentPath)) {
      this.log(`❌ Agent ${type} script not found at ${agentPath}`);
      return;
    }

    this.log(`🤖 Starting Agent ${type.toUpperCase()}...`);
    
    try {
      // Use fork to run agent as a child process
      const agent = fork(agentPath, [], {
        cwd: this.workspaceRoot,
        stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
        env: {
          ...process.env,
          NODE_ENV: process.env.NODE_ENV || 'development',
          AGENT_TYPE: type.toUpperCase()
        }
      });

      this.agents[type] = agent;
      this.status[type] = 'running';

      // Handle agent output
      agent.stdout.on('data', (data) => {
        const message = data.toString().trim();
        this.log(`[Agent ${type.toUpperCase()}] ${message}`);
        this.logs[type].push({ type: 'stdout', message, timestamp: new Date() });
      });

      agent.stderr.on('data', (data) => {
        const message = data.toString().trim();
        this.log(`[Agent ${type.toUpperCase()} ERROR] ${message}`);
        this.logs[type].push({ type: 'stderr', message, timestamp: new Date() });
      });

      // Handle agent messages
      agent.on('message', (message) => {
        this.handleAgentMessage(type, message);
      });

      // Handle agent exit
      agent.on('exit', (code, signal) => {
        this.status[type] = 'stopped';
        if (code === 0) {
          this.log(`✅ Agent ${type.toUpperCase()} completed successfully`);
        } else {
          this.log(`❌ Agent ${type.toUpperCase()} exited with code ${code} (signal: ${signal})`);
        }
      });

      // Handle agent errors
      agent.on('error', (error) => {
        this.log(`💥 Agent ${type.toUpperCase()} error: ${error.message}`);
        this.status[type] = 'error';
      });

      this.log(`✅ Agent ${type.toUpperCase()} started successfully`);
      
    } catch (error) {
      this.log(`💥 Failed to start Agent ${type.toUpperCase()}: ${error.message}`);
      this.status[type] = 'error';
    }
  }

  handleAgentMessage(agentType, message) {
    switch (message.type) {
      case 'task_started':
        this.log(`🔄 Agent ${agentType.toUpperCase()} started Task ${message.taskNumber}`);
        break;
      case 'task_completed':
        this.log(`✅ Agent ${agentType.toUpperCase()} completed Task ${message.taskNumber}`);
        this.updateTaskStatus(message.taskNumber, 'completed');
        break;
      case 'task_failed':
        this.log(`❌ Agent ${agentType.toUpperCase()} failed Task ${message.taskNumber}: ${message.error}`);
        this.updateTaskStatus(message.taskNumber, 'failed');
        break;
      case 'status_update':
        this.log(`📊 Agent ${agentType.toUpperCase()}: ${message.message}`);
        break;
      default:
        this.log(`📨 Agent ${agentType.toUpperCase()} message: ${JSON.stringify(message)}`);
    }
  }

  updateTaskStatus(taskNumber, status) {
    // In a real implementation, this would update the PROJECT_TASKS.md file
    // or a task tracking database
    this.log(`📝 Task ${taskNumber} status updated to: ${status}`);
  }

  monitorAgents() {
    setInterval(() => {
      const oddStatus = this.status.odd;
      const evenStatus = this.status.even;
      
      this.log(`📊 Status Check - Odd: ${oddStatus}, Even: ${evenStatus}`);
      
      // Restart failed agents
      if (oddStatus === 'error' || oddStatus === 'stopped') {
        this.log('🔄 Restarting Agent Odd...');
        this.startAgent('odd');
      }
      
      if (evenStatus === 'error' || evenStatus === 'stopped') {
        this.log('🔄 Restarting Agent Even...');
        this.startAgent('even');
      }
      
    }, 30000); // Check every 30 seconds
  }

  setupShutdown() {
    const shutdown = () => {
      this.log('🛑 Shutting down agents...');
      
      Object.keys(this.agents).forEach(type => {
        if (this.agents[type]) {
          this.agents[type].kill('SIGTERM');
        }
      });
      
      setTimeout(() => {
        this.log('💀 Force killing agents...');
        Object.keys(this.agents).forEach(type => {
          if (this.agents[type]) {
            this.agents[type].kill('SIGKILL');
          }
        });
        process.exit(0);
      }, 5000);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  }

  getStatus() {
    return {
      agents: this.status,
      logs: {
        odd: this.logs.odd.slice(-10), // Last 10 log entries
        even: this.logs.even.slice(-10)
      },
      uptime: process.uptime()
    };
  }

  async sendCommandToAgent(agentType, command, data = {}) {
    if (this.agents[agentType] && this.status[agentType] === 'running') {
      this.agents[agentType].send({ command, data });
      this.log(`📤 Sent command '${command}' to Agent ${agentType.toUpperCase()}`);
    } else {
      this.log(`❌ Cannot send command to Agent ${agentType.toUpperCase()} - not running`);
    }
  }

  // REST API for external control (optional)
  startAPI() {
    const express = require('express');
    const app = express();
    
    app.use(express.json());
    
    app.get('/status', (req, res) => {
      res.json(this.getStatus());
    });
    
    app.post('/agents/:type/command', (req, res) => {
      const { type } = req.params;
      const { command, data } = req.body;
      
      if (!['odd', 'even'].includes(type)) {
        return res.status(400).json({ error: 'Invalid agent type' });
      }
      
      this.sendCommandToAgent(type, command, data);
      res.json({ success: true, message: `Command sent to Agent ${type.toUpperCase()}` });
    });
    
    app.post('/restart/:type', (req, res) => {
      const { type } = req.params;
      
      if (!['odd', 'even'].includes(type)) {
        return res.status(400).json({ error: 'Invalid agent type' });
      }
      
      if (this.agents[type]) {
        this.agents[type].kill('SIGTERM');
      }
      
      setTimeout(() => {
        this.startAgent(type);
      }, 1000);
      
      res.json({ success: true, message: `Agent ${type.toUpperCase()} restart initiated` });
    });
    
    const port = process.env.COORDINATOR_PORT || 3001;
    app.listen(port, () => {
      this.log(`🌐 Coordinator API started on port ${port}`);
    });
  }
}

// Command line interface
async function main() {
  const coordinator = new AgentCoordinator();
  
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'start':
      await coordinator.start();
      
      // Optional: Start API server
      if (args.includes('--api')) {
        coordinator.startAPI();
      }
      break;
      
    case 'status':
      console.log(JSON.stringify(coordinator.getStatus(), null, 2));
      break;
      
    default:
      console.log(`
Multi-Agent Development Coordinator

Usage:
  node start-agents.js start [--api]    Start both development agents
  node start-agents.js status           Show current status

Examples:
  node start-agents.js start            Start agents in background
  node start-agents.js start --api      Start agents with REST API
  node start-agents.js status           Check agent status
      `);
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('💥 Coordinator error:', error);
    process.exit(1);
  });
}

module.exports = AgentCoordinator;