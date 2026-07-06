# MMAR-MCP Server

An MCP (Model Context Protocol) server that connects Large Language Models to the [MM-AR metamodeling platform](https://github.com/MM-AR/mmar), enabling users to create complete metamodels and model instances through natural language interaction.

## Overview

MMAR-MCP exposes the MM-AR platform's capabilities through the Model Context Protocol:

- **62 tools** for authentication, metamodel CRUD, and instance CRUD operations
- **5 resources** providing platform architecture, VizRep templates, the meta²-model schema, attribute types, and a reference metamodel
- **3 prompts** encoding guided workflows for metamodel creation, instance creation, and model analysis

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- A running instance of the MM-AR platform (see [mmar-docker-installation](https://github.com/MM-AR/mmar-docker-installation) for Docker-based setup)

## Installation

```bash
git clone https://github.com/MM-AR/mmar-mcp-server.git
cd mmar-mcp-server
npm install
npm run build
```

## Configuration

The server connects to the MM-AR API at `http://localhost:8000` by default. To change this, set the `MMAR_API_URL` environment variable:

```bash
export MMAR_API_URL=http://your-mmar-host:8000
```

## Usage with Cursor IDE

Add the following to your Cursor MCP configuration (`.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "mmar": {
      "command": "node",
      "args": ["/path/to/mmar-mcp-server/dist/index.js"]
    }
  }
}
```

After configuring, you can use the guided prompts in Cursor:

1. **create-metamodel** — Create a new modeling language from a natural language description
2. **create-model** — Create a model instance using an existing metamodel
3. **analyze-model** — Inspect and analyze existing models

## Project Structure

```
src/
├── index.ts              # Entry point
├── server.ts             # MCP server setup
├── config.ts             # Configuration
├── api-client.ts         # MM-AR REST API client
├── tools/
│   ├── index.ts          # Tool registration
│   ├── auth.tools.ts     # Authentication tools (3)
│   ├── meta.tools.ts     # Metamodel CRUD tools (26)
│   └── instance.tools.ts # Instance CRUD tools (33)
├── resources/
│   └── index.ts          # Resource definitions (5)
└── prompts/
    └── index.ts          # Prompt definitions (3)
```

## Related Repositories

- [mmar](https://github.com/MM-AR/mmar) — Main MM-AR platform repository
- [mmar-docker-installation](https://github.com/MM-AR/mmar-docker-installation) — Docker-based setup for the full MM-AR platform
- [mmar-server](https://github.com/MM-AR/mmar-server) — MM-AR REST API server

## License

ISC

## Citation

If you use this software in your research, please cite:

```bibtex
@inproceedings{chima2026mmar-mcp,
  title={Agentic Creation of Modeling Languages: Extending the MM-AR Metamodeling Platform with MCP},
  author={Chima, Prosper and Fill, Hans-Georg and Curty, Simon},
  booktitle={Proceedings of the International Conference on Conceptual Modeling (ER), Demos and Posters},
  year={2026}
}
```
