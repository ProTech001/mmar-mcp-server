/**
 * Instance Tools
 * 
 * MCP tools for creating, reading, updating, and deleting model instances.
 * These tools allow the LLM to create diagrams, add elements, connect them,
 * and manipulate attribute values, ports, roles, and bendpoints.
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
 * If line_points is missing or empty, auto-populate from source/target coordinates.
 * Looks up class instances either from a local array or via API.
 */
async function autoPopulateLinePoints(relData: any, localClassInstances?: any[]): Promise<void> {
  const hasLinePoints = relData.line_points && Array.isArray(relData.line_points) && relData.line_points.length > 0;
  if (hasLinePoints) {
    console.error(`[autoPopulateLinePoints] Skipping — already has ${relData.line_points.length} line_points`);
    return;
  }

  const sourceUuid = relData.role_instance_from?.uuid_has_reference_class_instance;
  const targetUuid = relData.role_instance_to?.uuid_has_reference_class_instance;
  console.error(`[autoPopulateLinePoints] sourceUuid=${sourceUuid}, targetUuid=${targetUuid}`);
  if (!sourceUuid || !targetUuid) {
    console.error(`[autoPopulateLinePoints] Missing source or target UUID, checking relData keys: ${Object.keys(relData).join(', ')}`);
    if (relData.role_instance_from) console.error(`  role_instance_from keys: ${Object.keys(relData.role_instance_from).join(', ')}`);
    if (relData.role_instance_to) console.error(`  role_instance_to keys: ${Object.keys(relData.role_instance_to).join(', ')}`);
    return;
  }

  let sourceCoords: any = null;
  let targetCoords: any = null;

  if (localClassInstances && Array.isArray(localClassInstances)) {
    console.error(`[autoPopulateLinePoints] Searching ${localClassInstances.length} local class instances`);
    const src = localClassInstances.find((ci: any) => ci.uuid === sourceUuid);
    const tgt = localClassInstances.find((ci: any) => ci.uuid === targetUuid);
    if (src) sourceCoords = src.coordinates_2d;
    if (tgt) targetCoords = tgt.coordinates_2d;
    console.error(`[autoPopulateLinePoints] Local lookup: src=${JSON.stringify(sourceCoords)}, tgt=${JSON.stringify(targetCoords)}`);
  }

  if (!sourceCoords) {
    try {
      const srcData = await apiClient.get(`/instances/classesInstances/${sourceUuid}`);
      sourceCoords = (srcData as any)?.coordinates_2d;
      console.error(`[autoPopulateLinePoints] API lookup src: ${JSON.stringify(sourceCoords)}`);
    } catch (e) { console.error(`[autoPopulateLinePoints] API lookup src failed: ${e}`); }
  }
  if (!targetCoords) {
    try {
      const tgtData = await apiClient.get(`/instances/classesInstances/${targetUuid}`);
      targetCoords = (tgtData as any)?.coordinates_2d;
      console.error(`[autoPopulateLinePoints] API lookup tgt: ${JSON.stringify(targetCoords)}`);
    } catch (e) { console.error(`[autoPopulateLinePoints] API lookup tgt failed: ${e}`); }
  }

  if (sourceCoords && targetCoords) {
    relData.line_points = [
      { UUID: sourceUuid, Point: { x: sourceCoords.x || 0, y: sourceCoords.y || 0, z: sourceCoords.z || 0 } },
      { UUID: targetUuid, Point: { x: targetCoords.x || 0, y: targetCoords.y || 0, z: targetCoords.z || 0 } },
    ];
    console.error(`[autoPopulateLinePoints] SUCCESS — populated line_points`);
  } else {
    console.error(`[autoPopulateLinePoints] FAILED — sourceCoords=${JSON.stringify(sourceCoords)}, targetCoords=${JSON.stringify(targetCoords)}`);
  }
}

/**
 * Register all instance-related tools on the MCP server.
 */
export function registerInstanceTools(server: McpServer): void {

  // ═══════════════════════════════════════════════
  //  SCENE INSTANCE TOOLS (from Phase 1)
  // ═══════════════════════════════════════════════

  server.tool(
    "mmar_list_scene_instances",
    "List all model instances (diagrams) for a specific modeling language (SceneType). Returns an array of SceneInstance objects with their UUIDs, names, and content.",
    {
      scene_type_uuid: z.string().uuid().describe("The UUID of the SceneType whose instances to list"),
    },
    async ({ scene_type_uuid }) => {
      try {
        return jsonResult(await apiClient.get(`/instances/sceneTypes/${scene_type_uuid}/sceneInstances`));
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.tool(
    "mmar_get_scene_instance",
    "Get the full details of a specific model instance (diagram) by its UUID. Returns the complete SceneInstance including all class instances, relationclass instances, attribute instances, role instances, and port instances.",
    {
      uuid: z.string().uuid().describe("The UUID of the SceneInstance to retrieve"),
    },
    async ({ uuid }) => {
      try {
        return jsonResult(await apiClient.get(`/instances/sceneInstances/${uuid}`));
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.tool(
    "mmar_create_scene_instance",
    "Create a new model instance (diagram) for a specific SceneType. The scene_instance_data should be a JSON object with at minimum: uuid (generate a new UUID v4), name, and optionally class_instances, relationclasses_instances, role_instances, attribute_instances, and port_instances arrays.",
    {
      scene_type_uuid: z.string().uuid().describe("The UUID of the SceneType to create an instance for"),
      scene_instance_data: z.string().describe("JSON string of the SceneInstance data to create. Must include 'uuid' (a new UUIDv4) and 'name'. Can include nested class_instances, relationclasses_instances, etc."),
    },
    async ({ scene_type_uuid, scene_instance_data }) => {
      try {
        const data = JSON.parse(scene_instance_data);
        const result = await apiClient.post(`/instances/sceneTypes/${scene_type_uuid}/sceneInstances`, data);
        const created = result as any;
        const sceneUuid = created?.uuid;
        console.error(`[create_scene] Created scene: ${sceneUuid}`);

        if (sceneUuid) {
          try {
            const fullScene = await apiClient.get(`/instances/sceneInstances/${sceneUuid}`) as any;
            const rels = fullScene?.relationclasses_instances || [];
            const classes = fullScene?.class_instances || [];
            console.error(`[create_scene] Fetched scene: ${rels.length} rels, ${classes.length} classes`);

            for (const rel of rels) {
              const lp = rel.line_points;
              const hasPoints = lp && Array.isArray(lp) && lp.length > 0;
              if (!hasPoints) {
                await autoPopulateLinePoints(rel, classes);
                if (rel.line_points && rel.line_points.length > 0) {
                  const relUuid = rel.uuid;
                  if (relUuid) {
                    try {
                      await apiClient.patch(`/instances/relationclassesInstances/${relUuid}`, {
                        uuid: rel.uuid,
                        uuid_relationclass: rel.uuid_relationclass,
                        name: rel.name,
                        line_points: rel.line_points,
                        role_instance_from: rel.role_instance_from,
                        role_instance_to: rel.role_instance_to,
                        attribute_instance: rel.attribute_instance || [],
                      });
                      console.error(`[create_scene] PATCH success for ${relUuid}`);
                    } catch (e) {
                      console.error(`[create_scene] PATCH FAILED for ${relUuid}: ${e}`);
                    }
                  }
                }
              }
            }
          } catch (e) {
            console.error(`[create_scene] Post-create fix failed: ${e}`);
          }
        }

        return successResult("SceneInstance created successfully.", result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.tool(
    "mmar_update_scene_instance",
    `Update an existing model instance (diagram). Uses smart diffing — new elements are added, existing ones updated.

IMPORTANT: This is the RECOMMENDED way to add connections (relationclass instances).
Include uuid_scene_type in the payload. New relationclasses_instances entries will be created.

The payload must include at minimum: uuid, name, uuid_scene_type.
Add relationclasses_instances array with connection objects including role_instance_from/to.`,
    {
      scene_instance_uuid: z.string().uuid().describe("The UUID of the SceneInstance to update"),
      scene_instance_data: z.string().describe("JSON string of the updated SceneInstance data. MUST include 'uuid_scene_type'. The server will diff against current state and apply changes."),
    },
    async ({ scene_instance_uuid, scene_instance_data }) => {
      try {
        const data = JSON.parse(scene_instance_data);
        if (data.relationclasses_instances && Array.isArray(data.relationclasses_instances)) {
          for (const rel of data.relationclasses_instances) {
            await autoPopulateLinePoints(rel, data.class_instances);
          }
        }
        const result = await apiClient.patch(`/instances/sceneInstances/${scene_instance_uuid}`, data);
        return successResult("SceneInstance updated successfully.", result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.tool(
    "mmar_delete_scene_instance",
    "Delete a specific model instance (diagram) and all its contents by UUID.",
    {
      uuid: z.string().uuid().describe("The UUID of the SceneInstance to delete"),
    },
    async ({ uuid }) => {
      try {
        const result = await apiClient.delete(`/instances/sceneInstances/${uuid}`);
        return successResult(`SceneInstance ${uuid} deleted successfully.`, result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ═══════════════════════════════════════════════
  //  CLASS INSTANCE TOOLS
  // ═══════════════════════════════════════════════

  server.tool(
    "mmar_get_class_instances",
    "Get all class instances (elements/nodes) within a specific scene instance (diagram).",
    {
      scene_instance_uuid: z.string().uuid().describe("The UUID of the SceneInstance"),
    },
    async ({ scene_instance_uuid }) => {
      try {
        return jsonResult(await apiClient.get(`/instances/sceneInstances/${scene_instance_uuid}/classesInstances`));
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.tool(
    "mmar_get_class_instance",
    "Get the full details of a specific class instance (element/node) by its UUID. Returns the class instance with its attribute instances, port instances, and position.",
    {
      uuid: z.string().uuid().describe("The UUID of the ClassInstance to retrieve"),
    },
    async ({ uuid }) => {
      try {
        return jsonResult(await apiClient.get(`/instances/classesInstances/${uuid}`));
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.tool(
    "mmar_create_class_instance",
    `Create a new class instance (element/node) within a scene instance.

IMPORTANT: The API does NOT auto-create attribute instances. You MUST include them in the payload.
For each attribute on the meta-Class, create an attribute_instance with:
  - uuid: new UUIDv4
  - name: same as meta-attribute name
  - value: the desired value (or the meta-attribute's default_value)
  - uuid_attribute: the meta-attribute's UUID

Example payload:
{
  "uuid": "<new UUIDv4>",
  "uuid_class": "<meta-Class UUID>",
  "name": "My Element",
  "coordinates_2d": {"x": 0, "y": 0, "z": 0},
  "attribute_instance": [
    { "uuid": "<new UUIDv4>", "name": "Name", "value": "My Element", "uuid_attribute": "<meta-attribute UUID>" }
  ]
}`,
    {
      scene_instance_uuid: z.string().uuid().describe("The UUID of the SceneInstance to add the element to"),
      class_instance_data: z.string().describe("JSON string of the ClassInstance data. Must include 'uuid', 'uuid_class', 'name', 'coordinates_2d', and 'attribute_instance' array."),
    },
    async ({ scene_instance_uuid, class_instance_data }) => {
      try {
        const data = JSON.parse(class_instance_data);
        const result = await apiClient.post(`/instances/sceneInstances/${scene_instance_uuid}/classesInstances`, data);
        return successResult("ClassInstance created successfully.", result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.tool(
    "mmar_update_class_instance",
    "Update an existing class instance. Send the complete desired state including position, attribute instances, etc.",
    {
      uuid: z.string().uuid().describe("The UUID of the ClassInstance to update"),
      class_instance_data: z.string().describe("JSON string of the updated ClassInstance data"),
    },
    async ({ uuid, class_instance_data }) => {
      try {
        const data = JSON.parse(class_instance_data);
        const result = await apiClient.patch(`/instances/classesInstances/${uuid}`, data);
        return successResult("ClassInstance updated successfully.", result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.tool(
    "mmar_delete_class_instance",
    "Delete a specific class instance (element/node) from a diagram by its UUID.",
    {
      uuid: z.string().uuid().describe("The UUID of the ClassInstance to delete"),
    },
    async ({ uuid }) => {
      try {
        const result = await apiClient.delete(`/instances/classesInstances/${uuid}`);
        return successResult(`ClassInstance ${uuid} deleted successfully.`, result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ═══════════════════════════════════════════════
  //  RELATIONCLASS INSTANCE TOOLS
  // ═══════════════════════════════════════════════

  server.tool(
    "mmar_get_relationclass_instances",
    "Get all relationclass instances (connections/edges) within a specific scene instance (diagram).",
    {
      scene_instance_uuid: z.string().uuid().describe("The UUID of the SceneInstance"),
    },
    async ({ scene_instance_uuid }) => {
      try {
        return jsonResult(await apiClient.get(`/instances/sceneInstances/${scene_instance_uuid}/relationclassesInstances`));
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.tool(
    "mmar_get_relationclass_instance",
    "Get the full details of a specific relationclass instance (connection/edge) by its UUID.",
    {
      uuid: z.string().uuid().describe("The UUID of the RelationclassInstance to retrieve"),
    },
    async ({ uuid }) => {
      try {
        return jsonResult(await apiClient.get(`/instances/relationclassesInstances/${uuid}`));
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.tool(
    "mmar_create_relationclass_instance",
    `Create a new relationclass instance (connection/edge) within a scene instance.

Include:
- uuid, uuid_class, uuid_relationclass (all set to the meta-Relationclass UUID)
- role_instance_from: { uuid, uuid_role, uuid_has_reference_class_instance }
- role_instance_to: { uuid, uuid_role, uuid_has_reference_class_instance }
- attribute_instance: [...] (for each attribute on the meta-Relationclass)

line_points are AUTO-POPULATED from source/target coordinates — you do NOT need to provide them.`,
    {
      scene_instance_uuid: z.string().uuid().describe("The UUID of the SceneInstance to add the connection to"),
      relationclass_instance_data: z.string().describe("JSON string of the RelationclassInstance data. Must include 'uuid', 'uuid_class', 'uuid_relationclass', 'role_instance_from', 'role_instance_to', and 'attribute_instance'."),
    },
    async ({ scene_instance_uuid, relationclass_instance_data }) => {
      try {
        const data = JSON.parse(relationclass_instance_data);
        await autoPopulateLinePoints(data);
        const result = await apiClient.post(`/instances/sceneInstances/${scene_instance_uuid}/relationclassesInstances`, [data]);
        return successResult("RelationclassInstance created successfully.", result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.tool(
    "mmar_update_relationclass_instance",
    "Update an existing relationclass instance (connection/edge). Send the complete desired state.",
    {
      uuid: z.string().uuid().describe("The UUID of the RelationclassInstance to update"),
      relationclass_instance_data: z.string().describe("JSON string of the updated RelationclassInstance data"),
    },
    async ({ uuid, relationclass_instance_data }) => {
      try {
        const data = JSON.parse(relationclass_instance_data);
        const result = await apiClient.patch(`/instances/relationclassesInstances/${uuid}`, data);
        return successResult("RelationclassInstance updated successfully.", result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.tool(
    "mmar_delete_relationclass_instance",
    "Delete a specific relationclass instance (connection/edge) from a diagram by its UUID.",
    {
      uuid: z.string().uuid().describe("The UUID of the RelationclassInstance to delete"),
    },
    async ({ uuid }) => {
      try {
        const result = await apiClient.delete(`/instances/relationclassesInstances/${uuid}`);
        return successResult(`RelationclassInstance ${uuid} deleted successfully.`, result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ═══════════════════════════════════════════════
  //  ATTRIBUTE INSTANCE TOOLS (Phase 3)
  // ═══════════════════════════════════════════════

  server.tool(
    "mmar_get_attribute_instance",
    "Get the full details of a specific attribute instance by its UUID. Returns the attribute value, type reference, and which element it belongs to.",
    {
      uuid: z.string().uuid().describe("The UUID of the AttributeInstance to retrieve"),
    },
    async ({ uuid }) => {
      try {
        return jsonResult(await apiClient.get(`/instances/attributesInstances/${uuid}`));
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.tool(
    "mmar_get_attribute_instances_for_class_instance",
    "Get all attribute instances for a specific class instance (element).",
    {
      class_instance_uuid: z.string().uuid().describe("The UUID of the ClassInstance"),
    },
    async ({ class_instance_uuid }) => {
      try {
        return jsonResult(await apiClient.get(`/instances/classesInstances/${class_instance_uuid}/attributesInstances`));
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.tool(
    "mmar_get_attribute_instances_for_relationclass_instance",
    "Get all attribute instances for a specific relationclass instance (connection).",
    {
      relationclass_instance_uuid: z.string().uuid().describe("The UUID of the RelationclassInstance"),
    },
    async ({ relationclass_instance_uuid }) => {
      try {
        return jsonResult(await apiClient.get(`/instances/relationclassesInstances/${relationclass_instance_uuid}/attributesInstances`));
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.tool(
    "mmar_update_attribute_instance",
    "Update the value of an attribute instance. Use this to change data values on elements (e.g., setting a name, description, or any custom attribute).",
    {
      attribute_instance_uuid: z.string().uuid().describe("The UUID of the AttributeInstance to update"),
      attribute_data: z.string().describe("JSON string of the updated AttributeInstance data. At minimum, include 'value' with the new value."),
    },
    async ({ attribute_instance_uuid, attribute_data }) => {
      try {
        const data = JSON.parse(attribute_data);
        const result = await apiClient.patch(`/instances/attributesInstances/${attribute_instance_uuid}`, data);
        return successResult("AttributeInstance updated successfully.", result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.tool(
    "mmar_delete_attribute_instance",
    "Delete a specific attribute instance by its UUID.",
    {
      uuid: z.string().uuid().describe("The UUID of the AttributeInstance to delete"),
    },
    async ({ uuid }) => {
      try {
        const result = await apiClient.delete(`/instances/attributesInstances/${uuid}`);
        return successResult(`AttributeInstance ${uuid} deleted successfully.`, result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ═══════════════════════════════════════════════
  //  ROLE INSTANCE TOOLS (Phase 3)
  // ═══════════════════════════════════════════════

  server.tool(
    "mmar_get_role_instance",
    "Get the full details of a specific role instance by its UUID. Returns the role instance with its class instance reference and cardinality.",
    {
      uuid: z.string().uuid().describe("The UUID of the RoleInstance to retrieve"),
    },
    async ({ uuid }) => {
      try {
        return jsonResult(await apiClient.get(`/instances/rolesInstances/${uuid}`));
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.tool(
    "mmar_get_role_from_for_relationclass_instance",
    "Get the source (from) role instance of a specific relationclass instance.",
    {
      relationclass_instance_uuid: z.string().uuid().describe("The UUID of the RelationclassInstance"),
    },
    async ({ relationclass_instance_uuid }) => {
      try {
        return jsonResult(await apiClient.get(`/instances/relationclassesInstances/${relationclass_instance_uuid}/roleFrom`));
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.tool(
    "mmar_get_role_to_for_relationclass_instance",
    "Get the destination (to) role instance of a specific relationclass instance.",
    {
      relationclass_instance_uuid: z.string().uuid().describe("The UUID of the RelationclassInstance"),
    },
    async ({ relationclass_instance_uuid }) => {
      try {
        return jsonResult(await apiClient.get(`/instances/relationclassesInstances/${relationclass_instance_uuid}/roleTo`));
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.tool(
    "mmar_update_role_instance",
    "Update an existing role instance. Use this to change which class instance a connection endpoint references.",
    {
      uuid: z.string().uuid().describe("The UUID of the RoleInstance to update"),
      role_instance_data: z.string().describe("JSON string of the updated RoleInstance data"),
    },
    async ({ uuid, role_instance_data }) => {
      try {
        const data = JSON.parse(role_instance_data);
        const result = await apiClient.patch(`/instances/rolesInstances/${uuid}`, data);
        return successResult("RoleInstance updated successfully.", result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ═══════════════════════════════════════════════
  //  PORT INSTANCE TOOLS (Phase 3)
  // ═══════════════════════════════════════════════

  server.tool(
    "mmar_get_port_instance",
    "Get the full details of a specific port instance by its UUID.",
    {
      uuid: z.string().uuid().describe("The UUID of the PortInstance to retrieve"),
    },
    async ({ uuid }) => {
      try {
        return jsonResult(await apiClient.get(`/instances/portsInstances/${uuid}`));
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.tool(
    "mmar_get_port_instances_for_scene_instance",
    "Get all port instances within a specific scene instance.",
    {
      scene_instance_uuid: z.string().uuid().describe("The UUID of the SceneInstance"),
    },
    async ({ scene_instance_uuid }) => {
      try {
        return jsonResult(await apiClient.get(`/instances/sceneInstances/${scene_instance_uuid}/portsInstances`));
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.tool(
    "mmar_create_port_instance",
    "Create a new port instance within a scene instance.",
    {
      scene_instance_uuid: z.string().uuid().describe("The UUID of the SceneInstance to add the port to"),
      port_instance_data: z.string().describe("JSON string of the PortInstance data including uuid, name, coordinates, and attribute instances"),
    },
    async ({ scene_instance_uuid, port_instance_data }) => {
      try {
        const data = JSON.parse(port_instance_data);
        const result = await apiClient.post(`/instances/sceneInstances/${scene_instance_uuid}/portsInstances`, data);
        return successResult("PortInstance created successfully.", result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.tool(
    "mmar_update_port_instance",
    "Update an existing port instance. Send the complete desired state.",
    {
      uuid: z.string().uuid().describe("The UUID of the PortInstance to update"),
      port_instance_data: z.string().describe("JSON string of the updated PortInstance data"),
    },
    async ({ uuid, port_instance_data }) => {
      try {
        const data = JSON.parse(port_instance_data);
        const result = await apiClient.patch(`/instances/portsInstances/${uuid}`, data);
        return successResult("PortInstance updated successfully.", result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.tool(
    "mmar_delete_port_instance",
    "Delete a specific port instance by its UUID.",
    {
      uuid: z.string().uuid().describe("The UUID of the PortInstance to delete"),
    },
    async ({ uuid }) => {
      try {
        const result = await apiClient.delete(`/instances/portsInstances/${uuid}`);
        return successResult(`PortInstance ${uuid} deleted successfully.`, result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ═══════════════════════════════════════════════
  //  BENDPOINT INSTANCE TOOLS (Phase 3)
  // ═══════════════════════════════════════════════

  server.tool(
    "mmar_get_bendpoints_for_relationclass_instance",
    "Get all bendpoint instances for a specific relationclass instance (connection). Bendpoints define intermediate waypoints on a connection line.",
    {
      relationclass_instance_uuid: z.string().uuid().describe("The UUID of the RelationclassInstance"),
    },
    async ({ relationclass_instance_uuid }) => {
      try {
        return jsonResult(await apiClient.get(`/instances/relationclassesInstances/${relationclass_instance_uuid}/bendpointsInstances`));
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.tool(
    "mmar_create_bendpoint",
    "Create a new bendpoint on a relationclass instance (connection). Bendpoints add waypoints to the connection line for routing.",
    {
      relationclass_instance_uuid: z.string().uuid().describe("The UUID of the RelationclassInstance to add the bendpoint to"),
      bendpoint_data: z.string().describe("JSON string of the Bendpoint data including uuid, coordinates_2d ({x, y, z}), and sequence"),
    },
    async ({ relationclass_instance_uuid, bendpoint_data }) => {
      try {
        const data = JSON.parse(bendpoint_data);
        const result = await apiClient.post(`/instances/relationclassesInstances/${relationclass_instance_uuid}/bendpointsInstances`, data);
        return successResult("Bendpoint created successfully.", result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.tool(
    "mmar_update_bendpoint",
    "Update an existing bendpoint. Use this to change the waypoint position.",
    {
      uuid: z.string().uuid().describe("The UUID of the Bendpoint to update"),
      bendpoint_data: z.string().describe("JSON string of the updated Bendpoint data"),
    },
    async ({ uuid, bendpoint_data }) => {
      try {
        const data = JSON.parse(bendpoint_data);
        const result = await apiClient.patch(`/instances/bendpointsInstances/${uuid}`, data);
        return successResult("Bendpoint updated successfully.", result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.tool(
    "mmar_delete_bendpoint",
    "Delete a specific bendpoint from a connection by its UUID.",
    {
      uuid: z.string().uuid().describe("The UUID of the Bendpoint to delete"),
    },
    async ({ uuid }) => {
      try {
        const result = await apiClient.delete(`/instances/bendpointsInstances/${uuid}`);
        return successResult(`Bendpoint ${uuid} deleted successfully.`, result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );
}
