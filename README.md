# MMAR-MCP Server

An [MCP](https://modelcontextprotocol.io/) (Model Context Protocol) server that connects Large Language Models to the [MM-AR metamodeling platform](https://github.com/MM-AR/mmar), enabling users to create complete metamodels and model instances through natural language interaction.

## Overview

MMAR-MCP exposes the MM-AR platform's capabilities through the Model Context Protocol:

- **62 tools** for authentication, metamodel CRUD, and instance CRUD operations
- **5 resources** providing platform architecture docs, VizRep templates, the meta-model schema, attribute types, and a reference metamodel
- **3 prompts** encoding guided workflows for metamodel creation, instance creation, and model analysis

The server communicates via STDIO transport and works with any MCP-compatible host (Cursor, Claude Desktop, or any client implementing the [MCP specification](https://spec.modelcontextprotocol.io/)).

## Prerequisites

| Requirement | Version | Purpose |
|---|---|---|
| [Node.js](https://nodejs.org/) | v18+ | Run the MCP server |
| [Docker](https://www.docker.com/) | Latest | Run the MM-AR platform stack |
| MCP host | Any | Connect LLMs to the server (e.g., [Cursor](https://www.cursor.com/), [Claude Desktop](https://claude.ai/download)) |

## Quick Start

Follow these five steps to go from zero to a working setup.

### Step 1: Start the MM-AR Platform

Clone and start the full MM-AR stack using Docker:

```bash
git clone https://github.com/MM-AR/mmar-docker-installation.git
cd mmar-docker-installation
docker compose --env-file .env up -d
```

Wait until all containers are healthy. You can check with:

```bash
docker compose ps
```

Once running, the following services are available:

| Service | URL | Description |
|---|---|---|
| API Server | http://localhost:8000 | REST API (the MCP server connects here) |
| Metamodeling Client | http://localhost:8070 | Define modeling languages |
| Modeling Client | http://localhost:8080 | Create model instances |
| VizRep Client | http://localhost:8090 | Design visual representations |

Verify the API is up by visiting http://localhost:8000/login in your browser. You should see a login page. Default credentials: `admin` / `admin`.

### Step 2: Clone and Build the MCP Server

```bash
git clone https://github.com/ProTech001/mmar-mcp-server.git
cd mmar-mcp-server
npm install
npm run build
```

The `npm run build` step compiles TypeScript to JavaScript in the `dist/` folder. This step is required before the server can run.

### Step 3: Verify the Installation

Run the end-to-end test suite to confirm everything works:

```bash
npm test
```

This spawns the MCP server as a child process and sends JSON-RPC messages via STDIO, exactly as a real MCP host would. It tests the handshake, authentication, tool listing, resource reading, prompt retrieval, and a full create/verify/delete cycle.

Expected output (all tests should pass):

```
==============================================
  MM-AR MCP Server — End-to-End Test
==============================================

  ✅ PASS  Initialize (handshake)
           → Server: mmar-mcp-server

  ✅ PASS  List Tools
           → 62 tools registered (expected 62)

  ✅ PASS  List Resources
           → 5 resource(s) (expected 5)

  ✅ PASS  Read Platform Info Resource
           → ...

  ...

==============================================
  Results: 16 passed, 0 failed, 16 total
==============================================
```

If any test fails, see the [Troubleshooting](#troubleshooting) section below.

### Step 4: Configure Your MCP Host

The server runs over STDIO. Configure your MCP host to launch it as a subprocess.

**Cursor IDE** — create or edit `.cursor/mcp.json` in your project root:

```json
{
  "mcpServers": {
    "mmar": {
      "command": "node",
      "args": ["/absolute/path/to/mmar-mcp-server/dist/index.js"],
      "env": {
        "MMAR_API_URL": "http://localhost:8000"
      }
    }
  }
}
```

**Claude Desktop** — add to your Claude Desktop configuration file (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "mmar": {
      "command": "node",
      "args": ["/absolute/path/to/mmar-mcp-server/dist/index.js"],
      "env": {
        "MMAR_API_URL": "http://localhost:8000"
      }
    }
  }
}
```

Replace `/absolute/path/to/mmar-mcp-server` with the actual path where you cloned the repository.

### Step 5: Start Using

Once configured, the MCP host can invoke any of the 62 tools. Three guided prompts are available for common workflows:

1. **create-metamodel** — Create a new modeling language from a natural language description
2. **create-model** — Create a model instance using an existing metamodel
3. **analyze-model** — Inspect and analyze existing models

Example: *"Use the create-metamodel prompt to create a Petri Net modeling language with Place nodes, Transition nodes, and Arc connections."*

## Configuration

The server reads one environment variable:

| Variable | Default | Description |
|---|---|---|
| `MMAR_API_URL` | `http://localhost:8000` | Base URL of the MM-AR REST API |

Set it via your shell, the MCP host config (see Step 4), or inline:

```bash
MMAR_API_URL=http://your-host:8000 node dist/index.js
```

## Tool Catalog

All 62 tools are prefixed with `mmar_` and grouped into three categories:

### Authentication (3 tools)

| Tool | Description |
|---|---|
| `mmar_login` | Authenticate with username and password |
| `mmar_check_session` | Check whether a session is active |
| `mmar_logout` | End the current session |

### Metamodel Operations (26 tools)

| Category | Tools |
|---|---|
| Scene types | `list_scene_types`, `get_scene_type`, `create_scene_type`, `update_scene_type`, `delete_scene_type` |
| Classes | `get_classes_for_scene_type`, `get_class`, `create_class`, `update_class`, `delete_class` |
| Relation classes | `get_relationclasses_for_scene_type`, `get_relationclass`, `create_relationclass`, `update_relationclass`, `delete_relationclass` |
| Attributes | `get_attribute`, `list_attribute_types`, `get_attribute_type`, `create_attribute_for_class`, `create_attribute_for_scene_type`, `update_attribute` |
| Roles | `get_role`, `update_role` |
| Ports | `get_port`, `create_port`, `update_port` |

### Instance Operations (33 tools)

| Category | Tools |
|---|---|
| Scenes | `list_scene_instances`, `get_scene_instance`, `create_scene_instance`, `update_scene_instance`, `delete_scene_instance` |
| Class instances | `get_class_instances`, `get_class_instance`, `create_class_instance`, `update_class_instance`, `delete_class_instance` |
| Relation instances | `get_relationclass_instances`, `get_relationclass_instance`, `create_relationclass_instance`, `update_relationclass_instance`, `delete_relationclass_instance` |
| Attribute instances | `get_attribute_instance`, `get_attribute_instances_for_class_instance`, `get_attribute_instances_for_relationclass_instance`, `update_attribute_instance`, `delete_attribute_instance` |
| Role instances | `get_role_instance`, `get_role_from_for_relationclass_instance`, `get_role_to_for_relationclass_instance`, `update_role_instance` |
| Port instances | `get_port_instance`, `get_port_instances_for_scene_instance`, `create_port_instance`, `update_port_instance`, `delete_port_instance` |
| Bendpoints | `get_bendpoints_for_relationclass_instance`, `create_bendpoint`, `update_bendpoint`, `delete_bendpoint` |

All tool names carry the `mmar_` prefix (e.g., `mmar_create_class`). The prefix is omitted in the table above for readability.

## Resources

| URI | Description |
|---|---|
| `mmar://platform/info` | Platform architecture overview and guided workflows |
| `mmar://reference/vizrep-templates` | VizRep code templates for visual representations |
| `mmar://reference/metamodel-schema` | JSON schema for the meta-model structure |
| `mmar://reference/attribute-types` | Available attribute types (String, Float, Boolean, etc.) |
| `mmar://reference/example-metamodel` | Complete Petri Net metamodel as a reference example |

## Project Structure

```
mmar-mcp-server/
├── src/
│   ├── index.ts              # Entry point (STDIO transport)
│   ├── server.ts             # MCP server setup and capability registration
│   ├── config.ts             # Configuration (reads MMAR_API_URL)
│   ├── api-client.ts         # MM-AR REST API client with JWT auth and retry logic
│   ├── tools/
│   │   ├── index.ts          # Tool registration hub
│   │   ├── auth.tools.ts     # Authentication tools (3)
│   │   ├── meta.tools.ts     # Metamodel CRUD tools (26)
│   │   └── instance.tools.ts # Instance CRUD tools (33)
│   ├── resources/
│   │   └── index.ts          # Resource definitions (5)
│   └── prompts/
│       └── index.ts          # Prompt definitions (3)
├── test-mcp.mjs              # End-to-end test suite
├── test-data/                 # Example payloads for MCP Inspector testing
│   ├── README.md
│   ├── example-ER-diagram-metamodel.json
│   └── example-petri-net-metamodel.json
├── package.json
├── tsconfig.json
└── .gitignore
```

## Testing with MCP Inspector

For interactive debugging, you can use the [MCP Inspector](https://github.com/modelcontextprotocol/inspector):

```bash
npm run inspect
```

This opens a web UI where you can browse tools, call them manually, and inspect request/response payloads. See `test-data/README.md` for step-by-step instructions and example payloads.

## Troubleshooting

### `ECONNREFUSED` or "Cannot connect to MM-AR API"

The MM-AR platform is not running or not reachable at the configured URL.

1. Check that Docker containers are running: `docker compose ps`
2. Verify the API is up: `curl http://localhost:8000/login`
3. If using a custom URL, ensure `MMAR_API_URL` is set correctly

### "Port 8000 already in use"

Another process is using port 8000. Either stop that process or configure the MM-AR platform to use a different port (see the [mmar-docker-installation](https://github.com/MM-AR/mmar-docker-installation) docs).

### Tests fail at "Login as admin"

The MM-AR database may not be fully initialized yet. The Docker containers need a few seconds after startup to complete database initialization. Wait 10-15 seconds after `docker compose up` and retry.

### "Cannot find module dist/index.js"

You need to compile the TypeScript source first:

```bash
npm run build
```

### MCP host does not detect the server

- Ensure the path in your MCP host config points to the **absolute path** of `dist/index.js`
- Restart the MCP host after changing the configuration
- Check that Node.js v18+ is installed: `node --version`

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
