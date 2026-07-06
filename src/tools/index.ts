/**
 * Tool Registry
 * 
 * Central registration point for all MCP tools.
 * Import and call each tool group's registration function here.
 */

export { registerAuthTools } from "./auth.tools.js";
export { registerMetaTools } from "./meta.tools.js";
export { registerInstanceTools } from "./instance.tools.js";
