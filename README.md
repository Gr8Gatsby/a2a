# tatou

> **Note:** This package is ESM-only. Use `import`/`export` and Node.js 16+.

## Overview

A robust TypeScript implementation of the Agent-to-Agent (A2A) protocol, with runtime validation, high test coverage, and modern developer experience.

## Quick Start

```typescript
import { Agent, Transport } from 'tatou';

const transport = new Transport({ protocol: 'ws', host: 'localhost' });
const agent = new Agent({
  name: 'MyAgent',
  description: 'A sample agent',
  capabilities: ['text'],
  endpoint: 'ws://localhost'
}, transport);

// Start a task
const task = await agent.startTask({ content: { type: 'text', content: 'Hello!' } });
```

## Type Safety & Runtime Validation

- All protocol types are defined in TypeScript (`src/types/`).
- All external data is validated at runtime using [zod](https://zod.dev/) schemas (`src/schemas/`).

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