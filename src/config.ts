/**
 * Configuration for the MM-AR MCP Server.
 * 
 * Environment variables can override defaults:
 *   MMAR_API_URL  — Base URL of the MM-AR REST API (default: http://localhost:8000)
 */

export const config = {
  /** Base URL for the MM-AR REST API server */
  apiBaseUrl: process.env.MMAR_API_URL || "http://localhost:8000",

  /** Server metadata */
  serverName: "mmar-mcp-server",
  serverVersion: "1.0.0",
} as const;
