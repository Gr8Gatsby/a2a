# Tatou - A2A TypeScript Implementation

A TypeScript implementation of the Agent-to-Agent (A2A) protocol, enabling seamless communication and interoperability between AI agents. This implementation is based on [Google's A2A Protocol](https://github.com/google/A2A).

## Overview

This package provides a robust TypeScript implementation of the A2A protocol, offering:

- Strongly typed interfaces for all A2A protocol components
- Comprehensive test suite using Vitest
- Full support for JSON-RPC 2.0 over HTTP(S)
- Type-safe agent discovery and communication
- Support for synchronous and asynchronous interactions
- Enterprise-ready security features

## Installation

```bash
npm install tatou
```

## Quick Start

```typescript
import { Agent, Transport } from 'tatou';

// Create a transport layer
const transport = new Transport({
  protocol: 'ws',
  host: 'my-agent.example.com',
  port: 8080
});

// Create a new agent
const agent = new Agent({
  name: 'MyAgent',
  description: 'A sample A2A agent',
  capabilities: ['text', 'json'],
  endpoint: 'https://my-agent.example.com'
}, transport);

// Start a new task
const task = await agent.startTask({
  content: {
    type: 'text',
    content: 'Hello, other agent!'
  }
});
```

### Working with Types

If you need to work with the type definitions directly:

```typescript
// Import types namespace
import { Types } from 'tatou';

// Or import specific types
import type { Agent, Task } from 'tatou/types';

// Use types for type annotations
const config: Types.AgentConfig = {
  name: 'MyAgent',
  description: 'A sample agent',
  capabilities: ['text'],
  endpoint: 'https://example.com'
};
```

## Features

- 🔒 Type-safe protocol implementation
- 🧪 Comprehensive test suite with Vitest
- 📦 NPM package for easy integration
- 🔄 Support for all A2A protocol features
- 📚 Detailed TypeScript documentation
- 🔍 Built-in type definitions

## Development

### Prerequisites

- Node.js 18+
- npm 8+

### Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/a2a-typescript.git
cd a2a-typescript

# Install dependencies
npm install

# Run tests
npm test
```

### Project Structure

```
src/
  ├── types/         # TypeScript type definitions
  ├── core/          # Core protocol implementation
  ├── transport/     # Transport layer (HTTP, WebSocket)
  ├── security/      # Security and authentication
  └── utils/         # Utility functions
tests/
  ├── unit/         # Unit tests
  ├── integration/  # Integration tests
  └── e2e/          # End-to-end tests
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## Documentation

For detailed documentation, please visit our [documentation site](https://your-docs-site.com).

## Roadmap

- [ ] Complete TypeScript type definitions
- [ ] Implement core protocol features
- [ ] Add comprehensive test suite
- [ ] Create documentation site
- [ ] Publish to npm
- [ ] Add example implementations
- [ ] Support for WebSocket transport
- [ ] Security enhancements

## Support

For support, please open an issue in the GitHub repository or contact us at [support@example.com](mailto:support@example.com).