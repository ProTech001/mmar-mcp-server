/**
 * Prompt Registry
 * 
 * MCP Prompts provide guided workflows the LLM can invoke.
 * Each prompt returns a structured message sequence that walks
 * through a multi-step task (e.g., metamodel creation).
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerPrompts(server: McpServer): void {

  // ─────────────────────────────────────────────
  // Prompt: create-metamodel
  // ─────────────────────────────────────────────
  server.prompt(
    "create-metamodel",
    "Guided workflow for creating a complete modeling language (SceneType) from a natural-language description. Walks through AttributeType discovery, UUID generation, class/relationclass design, VizRep geometry, and one-shot creation.",
    {
      language_name: z.string().describe("Name for the new modeling language (e.g., 'Petri Net', 'ER Diagram')"),
      description: z.string().describe("Natural-language description of the modeling language — what elements, connections, and attributes it should have"),
    },
    ({ language_name, description }) => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: `Create a modeling language called "${language_name}" in MM-AR.

Description: ${description}

Follow this EXACT workflow:

## Step 1 — Authenticate
Call \`mmar_login\` with username "admin" and password "admin" (or ask the user for credentials).

## Step 2 — Discover AttributeTypes
Call \`mmar_list_attribute_types\` to get the UUIDs for String, Float, Integer, Boolean, Enumeration, etc.
You MUST have these UUIDs before creating any attributes.

## Step 3 — Design the Metamodel
Based on the description, design:
- **Classes** (node types): What elements can be placed on a diagram?
- **Relationclasses** (edge types): How can elements be connected?
- **Attributes**: What data properties does each element need?
- **Roles**: What cardinality rules apply to connections? (role_from = source, role_to = destination)
- **VizRep Geometry**: What should each element look like? Use the gc.* API:
  - \`gc.graphic_cube(width, height, depth, color)\` for 3D boxes
  - \`gc.graphic_plane(width, height, color)\` for flat shapes
  - \`gc.graphic_sphere(radius, widthSeg, heightSeg, color)\` for circles
  - \`gc.graphic_text(x, y, z, size, color, text)\` for labels
  - \`gc.rel_graphic_line(color, width, dashed, dashScale, dashSize, gapSize)\` for connection lines

## Step 4 — Generate UUIDs
Pre-generate a UUIDv4 for EVERY object: the SceneType, each Class, each Attribute, each Relationclass, each Role.
Use a deterministic naming pattern for readability.

## Step 5 — Build the Payload
Construct the complete SceneType JSON with all nested classes, relationclasses, attributes, roles, and geometry.

## Step 6 — Create via One-Shot
Call \`mmar_create_scene_type\` with the full payload.
This is atomic — everything is created in a single transaction.

## Step 7 — Verify
Call \`mmar_get_scene_type\` to confirm the metamodel was created correctly.
Check that all classes, relationclasses, and attributes are present.

IMPORTANT:
- Every attribute needs an \`attribute_type\` with the UUID from Step 2
- Every class MUST have geometry (VizRep code) so it can be rendered in the modeling client — do NOT leave geometry as null
- Every relationclass MUST have geometry with \`gc.rel_graphic_line(...)\` for the connection line
- Relationclass roles need \`class_references\` pointing to the class UUIDs from this payload
- Role cardinality: use min=0, max=100 for "zero or more" (the most common default). NEVER use max=-1 — the MM-AR client rejects connections when max is negative.
- The \`sequence\` field on attributes determines display order (start from 1)
- The \`ui_component\` field determines the editor widget (use "text" for strings, "number" for numeric types)
- Read the \`mmar://reference/vizrep-templates\` resource for geometry examples before designing VizRep code`,
          },
        },
      ],
    })
  );

  // ─────────────────────────────────────────────
  // Prompt: create-model
  // ─────────────────────────────────────────────
  server.prompt(
    "create-model",
    "Guided workflow for creating a model instance (diagram) from a natural-language description of a system. Discovers the metamodel structure and creates elements + connections.",
    {
      scene_type_name: z.string().describe("Name of the modeling language to use (e.g., 'Petri Net')"),
      model_description: z.string().describe("Natural-language description of the system to model"),
    },
    ({ scene_type_name, model_description }) => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: `Create a model (diagram) using the "${scene_type_name}" modeling language in MM-AR.

Description of the system to model: ${model_description}

Follow this EXACT workflow:

## Step 1 — Authenticate
Call \`mmar_login\` if not already logged in.

## Step 2 — Find the Modeling Language
Call \`mmar_list_scene_types\` to find the SceneType for "${scene_type_name}".
Then call \`mmar_get_scene_type\` with its UUID to get the full metamodel structure.

## Step 3 — Understand the Metamodel
From the SceneType, identify:
- Available **Classes** (node types) — what elements can you create?
- Available **Relationclasses** (edge types) — how can elements be connected?
- **Attributes** on each class — what data must be set?
- **Roles** on relationclasses — which classes can each connection type link?
- **Cardinality** on roles — what are the min/max connections?

## Step 4 — Design the Model
Based on the description, plan:
- What element instances to create (and which meta-Class each corresponds to)
- How to connect them (which meta-Relationclass to use)
- Coordinates for positioning ({x, y, z}) — use COMPACT spacing (e.g., 1.5 to 2.5 units apart). The MM-AR canvas is relatively small, so keep coordinates within a range of roughly -5 to 5 on both x and y axes. Arrange elements in a logical 2D layout (not all in a single line).
- Attribute values for each element — these are CRITICAL for visual labels

## Step 5 — Create Everything in One Call
Call \`mmar_create_scene_instance\` with the FULL scene data including all class_instances and relationclasses_instances nested inside.

CRITICAL — ATTRIBUTE INSTANCES: Each class instance MUST include an \`attribute_instance\` array with a value for EVERY attribute defined on its meta-Class. The VizRep code reads attribute values to render labels/names on the canvas. If you do not populate attribute values, the elements will appear as blank shapes with no text.

For each class instance, include:
- \`uuid\`: new UUIDv4
- \`uuid_class\`: the meta-Class UUID
- \`name\`: descriptive name
- \`coordinates_2d\`: {x, y, z}
- \`attribute_instance\`: array of objects, each with:
  - \`uuid\`: new UUIDv4
  - \`name\`: MUST match the meta-attribute name exactly (e.g., "Name", "Description", "Condition")
  - \`value\`: the actual display value (e.g., "User writes prompt")
  - \`uuid_attribute\`: the meta-attribute's UUID

For each relationclass instance, include:
- \`uuid\`: new UUIDv4
- \`uuid_class\` and \`uuid_relationclass\`: both set to the meta-Relationclass UUID
- \`name\`: descriptive name for the connection
- \`role_instance_from\`: { uuid: new UUIDv4, uuid_role: <meta role_from UUID>, uuid_has_reference_class_instance: <source class instance UUID> }
- \`role_instance_to\`: { uuid: new UUIDv4, uuid_role: <meta role_to UUID>, uuid_has_reference_class_instance: <target class instance UUID> }
- \`attribute_instance\`: array for each attribute on the meta-Relationclass (e.g., Label), with the value set appropriately
Note: line_points are auto-populated from source/target coordinates — you do NOT need to provide them.

## Step 6 — Verify
Call \`mmar_get_scene_instance\` to confirm the complete model structure.
Check that all elements have attribute values and all connections have non-empty line_points arrays.`,
          },
        },
      ],
    })
  );

  // ─────────────────────────────────────────────
  // Prompt: analyze-model
  // ─────────────────────────────────────────────
  server.prompt(
    "analyze-model",
    "Guided workflow for analyzing an existing model — checks completeness, validates against metamodel rules, and identifies potential issues.",
    {
      scene_instance_uuid: z.string().describe("UUID of the model instance (SceneInstance) to analyze"),
    },
    ({ scene_instance_uuid }) => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: `Analyze the model instance with UUID "${scene_instance_uuid}" in MM-AR.

Follow this workflow:

## Step 1 — Authenticate
Call \`mmar_login\` if not already logged in.

## Step 2 — Load the Model
Call \`mmar_get_scene_instance\` with UUID "${scene_instance_uuid}" to get the full model.

## Step 3 — Load the Metamodel
From the scene instance, identify which SceneType it belongs to.
Call \`mmar_get_scene_type\` to load the metamodel definition.

## Step 4 — Structural Analysis
Check:
- How many class instances exist? Which meta-Classes are used?
- How many relationclass instances exist? Which connection types?
- Are there isolated elements (no connections)?
- Are there elements with missing required attributes (empty values)?

## Step 5 — Cardinality Validation
For each role in the metamodel:
- Check if min/max cardinality constraints are satisfied
- Identify elements with too few or too many connections

## Step 6 — Completeness Check
- Are all meta-Classes from the metamodel represented at least once?
- Are all required attributes filled in?
- Do all connections have valid source and destination references?

## Step 7 — Report
Provide a structured summary:
1. **Model Overview**: Element count, connection count
2. **Completeness Score**: % of metamodel elements used
3. **Issues Found**: List any validation errors or warnings
4. **Suggestions**: Recommendations for improving the model`,
          },
        },
      ],
    })
  );
}
