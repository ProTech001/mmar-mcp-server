# MMAR-MCP Server

An MCP (Model Context Protocol) server that connects Large Language Models to the [MM-AR metamodeling platform](https://github.com/MM-AR/mmar), enabling users to create complete metamodels and model instances through natural language interaction.

## Overview

MMAR-MCP exposes the MM-AR platform's capabilities through the Model Context Protocol:

- **62 tools** for authentication, metamodel CRUD, and instance CRUD operations
- **5 resources** providing platform architecture, VizRep templates, the meta²-model schema, attribute types, and a reference metamodel
- **3 prompts** encoding guided workflows for metamodel creation, instance creation, and model analysis

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- [Docker](https://www.docker.com/) (for running the MM-AR platform)
- [Cursor IDE](https://www.cursor.com/) (or another MCP-compatible host)

## Getting Started

### Step 1: Set up the MM-AR Platform

The MCP server requires a running instance of the MM-AR platform. The easiest way to set it up is using Docker:

```bash
git clone https://github.com/MM-AR/mmar-docker-installation.git
cd mmar-docker-installation
docker compose up -d
```

This starts the full MM-AR stack: PostgreSQL database, API server (port 8000), Modeling Client (port 8080), and Metamodeling Client (port 8070). See the [mmar-docker-installation README](https://github.com/MM-AR/mmar-docker-installation) for detailed configuration options.

### Step 2: Install the MCP Server

```bash
git clone https://github.com/ProTech001/mmar-mcp-server.git
cd mmar-mcp-server
npm install
npm run build
```

### Step 3: Configure Cursor IDE

Add the following to your Cursor MCP configuration file (`.cursor/mcp.json` in your project root):

```json
{
  "mcpServers": {
    "mmar": {
      "command": "node",
      "args": ["/absolute/path/to/mmar-mcp-server/dist/index.js"]
    }
  }
}
```

Replace `/absolute/path/to/mmar-mcp-server` with the actual path where you cloned the repository.

### Step 4: Start Using

Once configured, you can use the guided prompts in Cursor:

1. **create-metamodel** — Create a new modeling language from a natural language description
2. **create-model** — Create a model instance using an existing metamodel
3. **analyze-model** — Inspect and analyze existing models

For example, type in Cursor: *"Use the create-metamodel prompt to create a Petri Net modeling language with Place nodes, Transition nodes, and Arc connections."*

## Configuration

The server connects to the MM-AR API at `http://localhost:8000` by default. If your MM-AR instance runs on a different host or port, set the `MMAR_API_URL` environment variable:

```bash
export MMAR_API_URL=http://your-mmar-host:8000
```

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
