#!/usr/bin/env node

/**
 * MM-AR MCP Server — Entry Point
 * 
 * This is the main entry point for the MCP server.
 * It creates the server and connects it via STDIO transport,
 * which is the standard way MCP hosts (Claude Desktop, Cursor, etc.)
 * communicate with MCP servers.
 * 
 * Usage:
 *   node dist/index.js                          # Start with default settings
 *   MMAR_API_URL=http://localhost:8000 node dist/index.js  # Custom API URL
 * 
 * The server communicates via stdin/stdout using JSON-RPC 2.0 messages.
 */

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createMmarMcpServer } from "./server.js";

async function main(): Promise<void> {
  // Create the MCP server with all tools and resources
  const server = createMmarMcpServer();

  // Create STDIO transport (reads from stdin, writes to stdout)
  const transport = new StdioServerTransport();

  // Connect the server to the transport — this starts listening
  await server.connect(transport);

  // Log to stderr (stdout is reserved for MCP JSON-RPC messages)
  console.error("🚀 MM-AR MCP Server started successfully");
  console.error(`   API URL: ${process.env.MMAR_API_URL || "http://localhost:8000"}`);
  console.error("   Transport: STDIO");
  console.error("   Waiting for MCP host connection...");
}

// Run and handle fatal errors
main().catch((error) => {
  console.error("Fatal error starting MM-AR MCP Server:", error);
  process.exit(1);
});
