/**
 * Metamodel Tools
 * 
 * MCP tools for reading AND writing metamodel information in MM-AR.
 * 
 * READ tools let the LLM discover available modeling languages, their
 * classes, relationclasses, attributes, and structure.
 * 
 * WRITE tools let the LLM create, update, and delete entire modeling
 * languages (SceneTypes) and their components (classes, relationclasses,
 * attributes, roles, ports).
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiClient } from "../api-client.js";

function errorResult(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return {
    content: [{ type: "text" as const, text: `❌ Error: ${message}` }],
    isError: true,
  };
}

function jsonResult(data: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}

function successResult(label: string, data: unknown) {
  return {
    content: [{
      type: "text" as const,
      text: `✅ ${label}\n\n${JSON.stringify(data, null, 2)}`,
    }],
  };
}

/**
 * Register all metamodel-related tools on the MCP server.
 */
export function registerMetaTools(server: McpServer): void {

  // ═══════════════════════════════════════════════
  //  READ TOOLS
  // ═══════════════════════════════════════════════

  // ─────────────────────────────────────────────
  // Tool: mmar_list_scene_types
  // ─────────────────────────────────────────────
  server.tool(
    "mmar_list_scene_types",
    "List all available modeling languages (SceneTypes) in MM-AR. Each SceneType defines a modeling language with its classes, relations, and rules. Returns an array of SceneType objects with their UUIDs and names.",
    {},
    async () => {
      try {
        return jsonResult(await apiClient.get("/metamodel/sceneTypes"));
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─────────────────────────────────────────────
  // Tool: mmar_get_scene_type
  // ─────────────────────────────────────────────
  server.tool(
    "mmar_get_scene_type",
    "Get the full details of a specific modeling language (SceneType) by its UUID. Returns the complete SceneType including all its classes, relationclasses, attributes, ports, and roles.",
    {
      uuid: z.string().uuid().describe("The UUID of the SceneType to retrieve"),
    },
    async ({ uuid }) => {
      try {
        return jsonResult(await apiClient.get(`/metamodel/sceneTypes/${uuid}`));
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─────────────────────────────────────────────
  // Tool: mmar_get_classes_for_scene_type
  // ─────────────────────────────────────────────
  server.tool(
    "mmar_get_classes_for_scene_type",
    "Get all classes (node/shape types) defined in a specific modeling language (SceneType). Classes represent the elements that can be placed on a diagram.",
    {
      scene_type_uuid: z.string().uuid().describe("The UUID of the SceneType"),
    },
    async ({ scene_type_uuid }) => {
      try {
        return jsonResult(await apiClient.get(`/metamodel/sceneTypes/${scene_type_uuid}/classes`));
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─────────────────────────────────────────────
  // Tool: mmar_get_relationclasses_for_scene_type
  // ─────────────────────────────────────────────
  server.tool(
    "mmar_get_relationclasses_for_scene_type",
    "Get all relation types (edge/connection types) defined in a specific modeling language (SceneType). Relationclasses define how elements can be connected to each other, including their roles (source/destination rules).",
    {
      scene_type_uuid: z.string().uuid().describe("The UUID of the SceneType"),
    },
    async ({ scene_type_uuid }) => {
      try {
        return jsonResult(await apiClient.get(`/metamodel/sceneTypes/${scene_type_uuid}/relationclasses`));
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─────────────────────────────────────────────
  // Tool: mmar_get_class
  // ─────────────────────────────────────────────
  server.tool(
    "mmar_get_class",
    "Get the full details of a specific class (node type) by its UUID. Returns the class with its attributes, ports, and geometry (VizRep).",
    {
      uuid: z.string().uuid().describe("The UUID of the Class to retrieve"),
    },
    async ({ uuid }) => {
      try {
        return jsonResult(await apiClient.get(`/metamodel/classes/${uuid}`));
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─────────────────────────────────────────────
  // Tool: mmar_get_relationclass
  // ─────────────────────────────────────────────
  server.tool(
    "mmar_get_relationclass",
    "Get the full details of a specific relation type (edge type) by its UUID. Returns the relationclass with its role_from, role_to, attributes, and connection rules.",
    {
      uuid: z.string().uuid().describe("The UUID of the Relationclass to retrieve"),
    },
    async ({ uuid }) => {
      try {
        return jsonResult(await apiClient.get(`/metamodel/relationclasses/${uuid}`));
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─────────────────────────────────────────────
  // Tool: mmar_list_attribute_types
  // ─────────────────────────────────────────────
  server.tool(
    "mmar_list_attribute_types",
    "List all available attribute types in MM-AR (e.g., String, Float, Integer, Boolean, Enumeration, Table). These are the primitive data types that attributes can use. You MUST know these UUIDs before creating attributes on classes or relationclasses.",
    {},
    async () => {
      try {
        return jsonResult(await apiClient.get("/metamodel/attributeTypes"));
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─────────────────────────────────────────────
  // Tool: mmar_get_attribute_type
  // ─────────────────────────────────────────────
  server.tool(
    "mmar_get_attribute_type",
    "Get full details of a specific attribute type by UUID. Returns the type definition including its regex validation pattern, name, and description.",
    {
      uuid: z.string().uuid().describe("The UUID of the AttributeType to retrieve"),
    },
    async ({ uuid }) => {
      try {
        return jsonResult(await apiClient.get(`/metamodel/attributeTypes/${uuid}`));
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─────────────────────────────────────────────
  // Tool: mmar_get_attribute
  // ─────────────────────────────────────────────
  server.tool(
    "mmar_get_attribute",
    "Get the full details of a specific meta-attribute by UUID. Returns the attribute definition including its type, default value, sequence, and UI component.",
    {
      uuid: z.string().uuid().describe("The UUID of the Attribute to retrieve"),
    },
    async ({ uuid }) => {
      try {
        return jsonResult(await apiClient.get(`/metamodel/attributes/${uuid}`));
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─────────────────────────────────────────────
  // Tool: mmar_get_role
  // ─────────────────────────────────────────────
  server.tool(
    "mmar_get_role",
    "Get the full details of a specific role by UUID. Returns the role definition including its class_references (which classes it can connect to), port_references, and cardinality (min/max).",
    {
      uuid: z.string().uuid().describe("The UUID of the Role to retrieve"),
    },
    async ({ uuid }) => {
      try {
        return jsonResult(await apiClient.get(`/metamodel/roles/${uuid}`));
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─────────────────────────────────────────────
  // Tool: mmar_get_port
  // ─────────────────────────────────────────────
  server.tool(
    "mmar_get_port",
    "Get the full details of a specific port by UUID. Ports are connection points on classes.",
    {
      uuid: z.string().uuid().describe("The UUID of the Port to retrieve"),
    },
    async ({ uuid }) => {
      try {
        return jsonResult(await apiClient.get(`/metamodel/ports/${uuid}`));
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ═══════════════════════════════════════════════
  //  WRITE TOOLS — SceneType (full metamodel)
  // ═══════════════════════════════════════════════

  // ─────────────────────────────────────────────
  // Tool: mmar_create_scene_type
  // ─────────────────────────────────────────────
  server.tool(
    "mmar_create_scene_type",
    `Create a complete modeling language (SceneType) in MM-AR in a SINGLE atomic transaction. This is the primary way to create metamodels.

IMPORTANT RULES:
1. Pre-generate ALL UUIDs (v4) for every object in the payload (SceneType, Classes, Attributes, RelationClasses, Roles).
2. Call mmar_list_attribute_types FIRST to get AttributeType UUIDs (e.g., String, Float).
3. Classes are created BEFORE RelationClasses — role class_references must point to class UUIDs in the same payload.
4. Duplicate UUID → 409 CONFLICT.
5. The entire operation is atomic — all or nothing.

The scene_type_data JSON must follow this structure:
{
  "uuid": "<pre-generated>",
  "name": "My Language",
  "description": "...",
  "classes": [{ uuid, name, geometry, attributes: [{ uuid, name, attribute_type: { uuid, name }, default_value, sequence }], ports: [] }],
  "relationclasses": [{ uuid, name, geometry, role_from: { uuid, name, class_references: [{ uuid, min, max }] }, role_to: { uuid, name, class_references: [{ uuid, min, max }] }, attributes: [], ports: [] }],
  "attributes": [],
  "ports": [],
  "procedures": []
}`,
    {
      uuid: z.string().uuid().describe("The UUID for the new SceneType (pre-generate a UUIDv4)"),
      scene_type_data: z.string().describe("JSON string of the complete SceneType payload including nested classes, relationclasses, attributes, roles, ports, and procedures"),
    },
    async ({ uuid, scene_type_data }) => {
      try {
        const data = JSON.parse(scene_type_data);
        const result = await apiClient.post(`/metamodel/sceneTypes/${uuid}`, data);
        return successResult("SceneType created successfully.", result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─────────────────────────────────────────────
  // Tool: mmar_update_scene_type
  // ─────────────────────────────────────────────
  server.tool(
    "mmar_update_scene_type",
    `Update an existing modeling language (SceneType). Uses smart diff-based updates by default — new children are added, existing ones are updated.

Set hardpatch=true for FULL REPLACEMENT mode: children not in the payload will be DELETED. Use with caution.

Send the complete desired state of the SceneType (same structure as mmar_create_scene_type).`,
    {
      uuid: z.string().uuid().describe("The UUID of the SceneType to update"),
      scene_type_data: z.string().describe("JSON string of the updated SceneType data (complete desired state)"),
      hardpatch: z.boolean().default(false).describe("If true, children NOT in the payload are deleted (full replacement). Default: false (additive/update only)."),
    },
    async ({ uuid, scene_type_data, hardpatch }) => {
      try {
        const data = JSON.parse(scene_type_data);
        const query = hardpatch ? "?hardpatch=true" : "";
        const result = await apiClient.patch(`/metamodel/sceneTypes/${uuid}${query}`, data);
        return successResult("SceneType updated successfully.", result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─────────────────────────────────────────────
  // Tool: mmar_delete_scene_type
  // ─────────────────────────────────────────────
  server.tool(
    "mmar_delete_scene_type",
    "Delete a modeling language (SceneType) and ALL its contents (classes, relationclasses, attributes, etc.) permanently. This cannot be undone.",
    {
      uuid: z.string().uuid().describe("The UUID of the SceneType to delete"),
    },
    async ({ uuid }) => {
      try {
        const result = await apiClient.delete(`/metamodel/sceneTypes/${uuid}`);
        return successResult(`SceneType ${uuid} deleted successfully.`, result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ═══════════════════════════════════════════════
  //  WRITE TOOLS — Incremental Class operations
  // ═══════════════════════════════════════════════

  // ─────────────────────────────────────────────
  // Tool: mmar_create_class
  // ─────────────────────────────────────────────
  server.tool(
    "mmar_create_class",
    `Create a new class (node/shape type) and add it to an existing SceneType. Use this for incremental metamodel building instead of recreating the whole SceneType.

The class_data JSON should include: uuid, name, geometry (VizRep function or null), is_reusable, is_abstract, attributes (array), and ports (array).`,
    {
      scene_type_uuid: z.string().uuid().describe("The UUID of the SceneType to add the class to"),
      class_data: z.string().describe("JSON string of the Class data including uuid, name, attributes, ports, geometry"),
    },
    async ({ scene_type_uuid, class_data }) => {
      try {
        const data = JSON.parse(class_data);
        const result = await apiClient.post(`/metamodel/sceneTypes/${scene_type_uuid}/classes`, data);
        return successResult("Class created successfully.", result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─────────────────────────────────────────────
  // Tool: mmar_update_class
  // ─────────────────────────────────────────────
  server.tool(
    "mmar_update_class",
    "Update an existing class (node type). Send the complete desired state — the server will diff and apply changes to attributes, ports, and other properties.",
    {
      uuid: z.string().uuid().describe("The UUID of the Class to update"),
      class_data: z.string().describe("JSON string of the updated Class data (complete desired state)"),
    },
    async ({ uuid, class_data }) => {
      try {
        const data = JSON.parse(class_data);
        const result = await apiClient.patch(`/metamodel/classes/${uuid}`, data);
        return successResult("Class updated successfully.", result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─────────────────────────────────────────────
  // Tool: mmar_delete_class
  // ─────────────────────────────────────────────
  server.tool(
    "mmar_delete_class",
    "Delete a class (node type) from a metamodel permanently. This also removes its attributes, ports, and any role references to it.",
    {
      uuid: z.string().uuid().describe("The UUID of the Class to delete"),
    },
    async ({ uuid }) => {
      try {
        const result = await apiClient.delete(`/metamodel/classes/${uuid}`);
        return successResult(`Class ${uuid} deleted successfully.`, result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ═══════════════════════════════════════════════
  //  WRITE TOOLS — Incremental Relationclass operations
  // ═══════════════════════════════════════════════

  // ─────────────────────────────────────────────
  // Tool: mmar_create_relationclass
  // ─────────────────────────────────────────────
  server.tool(
    "mmar_create_relationclass",
    `Create a new relationclass (edge/connection type) and add it to an existing SceneType.

IMPORTANT: The classes referenced in role_from.class_references and role_to.class_references MUST already exist in the SceneType.

The relationclass_data JSON should include: uuid, name, geometry, role_from (with uuid, name, class_references[{uuid, min, max}]), role_to (same structure), bendpoint, attributes, ports.`,
    {
      scene_type_uuid: z.string().uuid().describe("The UUID of the SceneType to add the relationclass to"),
      relationclass_data: z.string().describe("JSON string of the Relationclass data including uuid, name, role_from, role_to, attributes, ports"),
    },
    async ({ scene_type_uuid, relationclass_data }) => {
      try {
        const data = JSON.parse(relationclass_data);
        const result = await apiClient.post(`/metamodel/sceneTypes/${scene_type_uuid}/relationClasses`, data);
        return successResult("Relationclass created successfully.", result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─────────────────────────────────────────────
  // Tool: mmar_update_relationclass
  // ─────────────────────────────────────────────
  server.tool(
    "mmar_update_relationclass",
    "Update an existing relationclass (edge type). Send the complete desired state — the server will diff and apply changes to roles, attributes, and other properties.",
    {
      uuid: z.string().uuid().describe("The UUID of the Relationclass to update"),
      relationclass_data: z.string().describe("JSON string of the updated Relationclass data (complete desired state)"),
    },
    async ({ uuid, relationclass_data }) => {
      try {
        const data = JSON.parse(relationclass_data);
        const result = await apiClient.patch(`/metamodel/relationclasses/${uuid}`, data);
        return successResult("Relationclass updated successfully.", result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─────────────────────────────────────────────
  // Tool: mmar_delete_relationclass
  // ─────────────────────────────────────────────
  server.tool(
    "mmar_delete_relationclass",
    "Delete a relationclass (edge type) from a metamodel permanently. This also removes its roles, attributes, and ports.",
    {
      uuid: z.string().uuid().describe("The UUID of the Relationclass to delete"),
    },
    async ({ uuid }) => {
      try {
        const result = await apiClient.delete(`/metamodel/relationclasses/${uuid}`);
        return successResult(`Relationclass ${uuid} deleted successfully.`, result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ═══════════════════════════════════════════════
  //  WRITE TOOLS — Attribute operations
  // ═══════════════════════════════════════════════

  // ─────────────────────────────────────────────
  // Tool: mmar_create_attribute_for_class
  // ─────────────────────────────────────────────
  server.tool(
    "mmar_create_attribute_for_class",
    "Add a new attribute to an existing class. The attribute_data must include uuid, name, attribute_type (with uuid and name of an existing AttributeType), default_value, sequence, and ui_component.",
    {
      class_uuid: z.string().uuid().describe("The UUID of the Class to add the attribute to"),
      attribute_data: z.string().describe("JSON string of the Attribute data: { uuid, name, attribute_type: { uuid, name }, default_value, sequence, ui_component }"),
    },
    async ({ class_uuid, attribute_data }) => {
      try {
        const data = JSON.parse(attribute_data);
        const result = await apiClient.post(`/metamodel/classes/${class_uuid}/attributes`, data);
        return successResult("Attribute added to class successfully.", result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─────────────────────────────────────────────
  // Tool: mmar_create_attribute_for_scene_type
  // ─────────────────────────────────────────────
  server.tool(
    "mmar_create_attribute_for_scene_type",
    "Add a new attribute to an existing SceneType (scene-level attribute, not on a class). Same structure as class attributes.",
    {
      scene_type_uuid: z.string().uuid().describe("The UUID of the SceneType to add the attribute to"),
      attribute_data: z.string().describe("JSON string of the Attribute data: { uuid, name, attribute_type: { uuid, name }, default_value, sequence, ui_component }"),
    },
    async ({ scene_type_uuid, attribute_data }) => {
      try {
        const data = JSON.parse(attribute_data);
        const result = await apiClient.post(`/metamodel/sceneTypes/${scene_type_uuid}/attributes`, data);
        return successResult("Attribute added to SceneType successfully.", result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─────────────────────────────────────────────
  // Tool: mmar_update_attribute
  // ─────────────────────────────────────────────
  server.tool(
    "mmar_update_attribute",
    "Update an existing meta-attribute. Send the updated attribute data including name, default_value, sequence, ui_component, and attribute_type.",
    {
      uuid: z.string().uuid().describe("The UUID of the Attribute to update"),
      attribute_data: z.string().describe("JSON string of the updated Attribute data"),
    },
    async ({ uuid, attribute_data }) => {
      try {
        const data = JSON.parse(attribute_data);
        const result = await apiClient.patch(`/metamodel/attributes/${uuid}`, data);
        return successResult("Attribute updated successfully.", result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ═══════════════════════════════════════════════
  //  WRITE TOOLS — Role operations
  // ═══════════════════════════════════════════════

  // ─────────────────────────────────────────────
  // Tool: mmar_update_role
  // ─────────────────────────────────────────────
  server.tool(
    "mmar_update_role",
    "Update an existing role on a relationclass. Use this to change cardinality (min/max) or which classes a role can connect to (class_references). Send the complete desired state of the role.",
    {
      uuid: z.string().uuid().describe("The UUID of the Role to update"),
      role_data: z.string().describe("JSON string of the updated Role data including class_references, port_references, and other properties"),
    },
    async ({ uuid, role_data }) => {
      try {
        const data = JSON.parse(role_data);
        const result = await apiClient.patch(`/metamodel/roles/${uuid}`, data);
        return successResult("Role updated successfully.", result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ═══════════════════════════════════════════════
  //  WRITE TOOLS — Port operations
  // ═══════════════════════════════════════════════

  // ─────────────────────────────────────────────
  // Tool: mmar_create_port
  // ─────────────────────────────────────────────
  server.tool(
    "mmar_create_port",
    "Create a new port (connection point) on a class. Ports define where connections can attach to an element.",
    {
      uuid: z.string().uuid().describe("The UUID for the new Port (pre-generate a UUIDv4)"),
      port_data: z.string().describe("JSON string of the Port data including uuid, name, geometry, and any attributes"),
    },
    async ({ uuid, port_data }) => {
      try {
        const data = JSON.parse(port_data);
        const result = await apiClient.post(`/metamodel/ports/${uuid}`, data);
        return successResult("Port created successfully.", result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─────────────────────────────────────────────
  // Tool: mmar_update_port
  // ─────────────────────────────────────────────
  server.tool(
    "mmar_update_port",
    "Update an existing port. Send the complete desired state of the port.",
    {
      uuid: z.string().uuid().describe("The UUID of the Port to update"),
      port_data: z.string().describe("JSON string of the updated Port data"),
    },
    async ({ uuid, port_data }) => {
      try {
        const data = JSON.parse(port_data);
        const result = await apiClient.patch(`/metamodel/ports/${uuid}`, data);
        return successResult("Port updated successfully.", result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );
}
