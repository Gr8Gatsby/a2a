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
  capabilities: ['text'],
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
  capabilities: ['text'],
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
  readonly capabilities: string[];
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

## Type Safety & Runtime Validation

- All protocol types are defined in TypeScript (`src/types/`).
- All external data is validated at runtime using [zod](https://zod.dev/) schemas (`src/schemas/`).
- **Type imports:** You can now import protocol and task types directly:
  ```typescript
  import { ProtocolMessage, Task, TaskStatus, AgentConfig } from 'tatou';
  ```
  Or, for all types:
  ```typescript
  import { Types } from 'tatou';
  // Types.ProtocolMessage, Types.Task, etc.
  ```

## Testing

- **Type tests:** Compile-time only, ensure type safety.
- **Runtime tests:** Validate schemas with zod.
- **Core tests:** Test all implementation logic.
- Run all tests: `npm test`
- Run coverage: `npm run test:coverage`

## Coverage

- 90%+ coverage enforced.
- Defensive code is documented and excluded from coverage.

## Local Development

- Build and link locally: `npm run link-local`
- In your test project: `npm link tatou`

## Directory Structure

```
src/
  core/      # Implementation
  schemas/   # zod schemas for runtime validation
  types/     # TypeScript types/interfaces
tests/
  unit/      # All test suites (type, runtime, core)
```

## Contributing

- Fork, branch, and submit PRs.
- Run all tests before submitting.
- See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

Apache-2.0

## Links

- [A2A Protocol Spec](https://github.com/google/A2A)
- [zod Documentation](https://zod.dev/)