# MCP Inspector Test Data

This folder contains ready-to-paste example payloads for testing
metamodel creation tools in the MCP Inspector.

## How to use

1. Start the platform (Docker + API Server from the Control Panel)
2. Launch MCP Inspector: `npm run inspect` from `mmar-mcp-server/`
3. Connect to the server
4. Call `mmar_login` with username: `admin`, password: `admin`
5. **Call `mmar_list_attribute_types` first** to get your actual AttributeType UUIDs
6. Replace the placeholder UUIDs in the examples below with real ones from your DB
7. Copy-paste the example data into the tool parameters

## Important Notes

- The AttributeType UUIDs (String, Float, etc.) vary per database instance
- You MUST call `mmar_list_attribute_types` to discover the real UUIDs
- All other UUIDs in the examples are pre-generated and safe to use as-is
- After testing, clean up by calling `mmar_delete_scene_type`
