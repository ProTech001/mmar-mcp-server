/**
 * Authentication Tools
 * 
 * MCP tools for authenticating with the MM-AR platform.
 * These must be called before any other tools that require API access.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiClient } from "../api-client.js";

/**
 * Register all authentication-related tools on the MCP server.
 */
export function registerAuthTools(server: McpServer): void {

  // ─────────────────────────────────────────────
  // Tool: mmar_login
  // ─────────────────────────────────────────────
  server.tool(
    "mmar_login",
    "Log in to the MM-AR metamodeling platform. This MUST be called first before using any other MM-AR tools. Returns a confirmation that the session is active.",
    {
      username: z.string().describe("The MM-AR username (e.g., 'admin')"),
      password: z.string().describe("The MM-AR password (e.g., 'admin')"),
    },
    async ({ username, password }) => {
      try {
        await apiClient.login(username, password);
        return {
          content: [
            {
              type: "text" as const,
              text: `✅ Successfully logged in to MM-AR as "${username}". Session is now active. You can now use other MM-AR tools.`,
            },
          ],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: "text" as const,
              text: `❌ Login failed: ${message}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // ─────────────────────────────────────────────
  // Tool: mmar_check_session
  // ─────────────────────────────────────────────
  server.tool(
    "mmar_check_session",
    "Check if there is an active MM-AR session (i.e., if the user is currently logged in).",
    {},
    async () => {
      const isAuth = apiClient.isAuthenticated();
      return {
        content: [
          {
            type: "text" as const,
            text: isAuth
              ? "✅ Session is active. You are logged in to MM-AR."
              : "❌ No active session. Please call mmar_login first.",
          },
        ],
      };
    }
  );

  // ─────────────────────────────────────────────
  // Tool: mmar_logout
  // ─────────────────────────────────────────────
  server.tool(
    "mmar_logout",
    "Log out from the MM-AR platform by clearing the stored session token.",
    {},
    async () => {
      apiClient.clearToken();
      return {
        content: [
          {
            type: "text" as const,
            text: "✅ Successfully logged out from MM-AR. Session cleared.",
          },
        ],
      };
    }
  );
}
