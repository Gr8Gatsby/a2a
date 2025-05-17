# tatou

> **Note:** This package is ESM-only. Use `import`/`export` and Node.js 16+.

## Overview

A robust TypeScript implementation of the Agent-to-Agent (A2A) protocol, with runtime validation, high test coverage, and modern developer experience.

## Quick Start

```typescript
import { Agent, Transport, ProtocolMessage, Task, TaskStatus, AgentConfig } from 'tatou';

const config: AgentConfig = {
  name: 'MyAgent',
  description: 'A sample agent',
  capabilities: {
    streaming: true,
    pushNotifications: false,
    stateTransitionHistory: true
  },
  endpoint: 'ws://localhost',
  version: '1.0.0',
  metadata: {
    author: 'Jane Doe',
    tags: ['example', 'demo'],
    customField: 'customValue'
  }
};

const transport = new Transport({ protocol: 'ws', host: 'localhost' });
const agent = new Agent(config, transport);

// Start a task
const task = await agent.startTask({ content: { type: 'text', content: 'Hello!' } });

// Get task status
const status = await agent.getTaskStatus(task.id);

// List all tasks
const tasks = await agent.listTasks();

// Listen for events
agent.on('taskStarted', (task) => {
  console.log('Task started:', task);
});

// Emit an event (for custom logic)
agent.emit('customEvent', { foo: 'bar' });

// Use protocol and task types directly
const message: ProtocolMessage = {
  jsonrpc: '2.0',
  id: '1',
  method: 'startTask',
  params: { /* ... */ }
};

const statusType: TaskStatus = 'pending';
```

## AgentConfig & Agent Interface

The `AgentConfig` and `Agent` interfaces are designed for extensibility and protocol compatibility:

```typescript
import { AgentConfig, Agent } from 'tatou';

const config: AgentConfig = {
  name: 'MyAgent',
  description: 'A sample agent',
  capabilities: {
    streaming: true,
    pushNotifications: false,
    stateTransitionHistory: true
  },
  endpoint: 'ws://localhost',
  version: '1.0.0',
  metadata: {
    author: 'Jane Doe',
    tags: ['example', 'demo'],
    customField: 'customValue'
  }
};

// Agent interface includes task management and event handling
interface Agent {
  readonly name: string;
  readonly description: string;
  readonly capabilities: AgentCapabilities;
  readonly endpoint: string;
  readonly version: string;
  readonly metadata?: Record<string, unknown>;

  startTask(params: unknown): Promise<Task>;
  getTaskStatus(taskId: string): Promise<TaskStatus>;
  listTasks(): Promise<Task[]>;

  on(event: string, listener: (...args: any[]) => void): this;
  emit(event: string, ...args: any[]): boolean;
}
```

## Agent Skills

The `skills` property of `AgentConfig` allows you to describe the specific capabilities or functions your agent can perform, following the A2A spec:

```typescript
import { AgentSkill } from 'tatou';

const skills: AgentSkill[] = [
  {
    id: 'summarize-text',
    name: 'Text Summarizer',
    description: 'Summarizes input text.',
    tags: ['nlp', 'summarization'],
    examples: ['Summarize this article', 'TL;DR for the following text'],
    inputModes: ['text/plain'],
    outputModes: ['text/plain']
  },
  {
    id: 'currency-converter',
    name: 'Currency Converter',
    tags: ['finance', 'conversion'],
    examples: ['convert 100 USD to EUR'],
    inputModes: ['application/json'],
    outputModes: ['application/json']
  }
];

const config: AgentConfig = {
  name: 'MyAgent',
  description: 'A sample agent',
  capabilities: { streaming: true },
  endpoint: 'ws://localhost',
  version: '1.0.0',
  skills,
};
```

## Agent Authentication

The `authentication` property of `AgentConfig` describes the authentication requirements for accessing the agent's endpoint, following the A2A spec:

```typescript
import { AgentAuthentication } from 'tatou';

const authentication: AgentAuthentication = {
  schemes: ['OAuth2', 'ApiKey'],
  credentials: '{"authorizationUrl": "https://auth.example.com", "tokenUrl": "https://token.example.com"}'
};

const config: AgentConfig = {
  name: 'MyAgent',
  description: 'A sample agent',
  capabilities: { streaming: true },
  endpoint: 'ws://localhost',
  version: '1.0.0',
  authentication,
};
```