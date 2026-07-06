/**
 * MM-AR MCP Server Definition
 * 
 * Creates and configures the MCP server with all tools, resources, and prompts.
 * This is the core of the application — it wires everything together.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { config } from "./config.js";
import { registerAuthTools, registerMetaTools, registerInstanceTools } from "./tools/index.js";
import { registerResources } from "./resources/index.js";
import { registerPrompts } from "./prompts/index.js";

/**
 * Create and configure the MM-AR MCP Server.
 * 
 * @returns A fully configured McpServer ready to connect via transport.
 */
export function createMmarMcpServer(): McpServer {
  const server = new McpServer({
    name: config.serverName,
    version: config.serverVersion,
  });

  // ─────────────────────────────────────────────
  // Register Tools
  // ─────────────────────────────────────────────

  registerAuthTools(server);         // 3 tools: login, logout, session check
  registerMetaTools(server);         // 26 tools: metamodel read + write
  registerInstanceTools(server);     // 30+ tools: instance CRUD, ports, roles, bendpoints

  // ─────────────────────────────────────────────
  // Register Resources
  // ─────────────────────────────────────────────

  registerResources(server);         // 5 resources: platform info, vizrep templates, schema, attr types, example

  // ─────────────────────────────────────────────
  // Register Prompts
  // ─────────────────────────────────────────────

  registerPrompts(server);           // 3 prompts: create-metamodel, create-model, analyze-model

  return server;
}
