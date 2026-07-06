/**
 * Resource Registry
 * 
 * MCP Resources expose data that the LLM can read as context.
 * These provide reference material for metamodel creation,
 * VizRep geometry templates, JSON schemas, and examples.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { apiClient } from "../api-client.js";

export function registerResources(server: McpServer): void {

  // ═══════════════════════════════════════════════
  //  Resource: Platform Info (from Phase 1)
  // ═══════════════════════════════════════════════
  server.resource(
    "platform-info",
    "mmar://platform/info",
    {
      description: "General information about the MM-AR metamodeling platform, its concepts, and how to use the MCP tools.",
      mimeType: "text/plain",
    },
    async () => ({
      contents: [{
        uri: "mmar://platform/info",
        mimeType: "text/plain",
        text: `MM-AR Metamodeling Platform — MCP Server Guide
=================================================

The MM-AR platform is a web-based metamodeling environment for defining
and using modeling languages in 2D and 3D.

Key Concepts:
─────────────
• SceneType   — A modeling language definition (e.g., "Petri Net", "BPMN")
• Class       — A node/shape type within a SceneType (e.g., "Place", "Transition")
• Relationclass — A connection/edge type (e.g., "Arc", "Flow")
• Attribute   — A data property on any element (e.g., "name", "tokens", "weight")
• Port        — A connection point on a Class
• Role        — Cardinality & connection rules (role_from = source, role_to = destination)

Instance Layer (Models):
────────────────────────
• SceneInstance      — A diagram / model (an instance of a SceneType)
• ClassInstance      — An element on the diagram (instance of a Class)
• RelationclassInstance — A connection on the diagram (instance of a Relationclass)
• AttributeInstance  — A data value (instance of an Attribute)
• RoleInstance       — A connection endpoint reference
• PortInstance       — A connection point on a ClassInstance

Workflow A — Create a Model Instance (on an existing modeling language):
─────────────────────────────────────────────────────────────────────
1. mmar_login → Authenticate with the platform
2. mmar_list_scene_types → See available modeling languages
3. mmar_get_scene_type → Explore a specific language structure
4. mmar_create_scene_instance → Create a new diagram
5. mmar_create_class_instance → Add elements (include attribute_instance array!)
6. mmar_update_scene_instance → Add connections via PATCH (include uuid_scene_type)
7. mmar_update_attribute_instance → Update data values

IMPORTANT Instance Notes:
─────────────────────────
• The API does NOT auto-create attribute instances — include them when creating class instances
• Use attribute_instance (singular) as the array key, not attribute_instances (plural)
• For connections: use mmar_update_scene_instance (PATCH) instead of direct POST (known API bug)
• Always include uuid_scene_type when PATCHing a scene instance

Workflow B — Create a Modeling Language (metamodel):
────────────────────────────────────────────────────
1. mmar_login → Authenticate with the platform
2. mmar_list_attribute_types → Get available data types (String, Float, etc.) and their UUIDs
3. Pre-generate UUIDs (v4) for ALL objects: SceneType, Classes, Attributes, RelationClasses, Roles
4. mmar_create_scene_type → Create the entire metamodel in one atomic call
   OR use incremental tools: mmar_create_class, mmar_create_relationclass, etc.
5. mmar_get_scene_type → Verify the result

Workflow C — Modify an existing Modeling Language:
──────────────────────────────────────────────────
1. mmar_get_scene_type → Read current state
2. mmar_update_scene_type → Patch with desired changes (hardpatch=true for full replace)
   OR use incremental: mmar_create_class, mmar_update_class, mmar_delete_class, etc.

Session Status: ${apiClient.isAuthenticated() ? "✅ Active" : "❌ Not logged in"}
API Base URL: ${process.env.MMAR_API_URL || "http://localhost:8000"}
`,
      }],
    })
  );

  // ═══════════════════════════════════════════════
  //  Resource: VizRep Templates (Phase 3)
  // ═══════════════════════════════════════════════
  server.resource(
    "vizrep-templates",
    "mmar://reference/vizrep-templates",
    {
      description: "Visual Representation (VizRep) geometry code templates for common modeling element shapes. CRITICAL: Elements without geometry cannot be dragged onto the modeling canvas.",
      mimeType: "text/plain",
    },
    async () => ({
      contents: [{
        uri: "mmar://reference/vizrep-templates",
        mimeType: "text/plain",
        text: VIZREP_TEMPLATES,
      }],
    })
  );

  // ═══════════════════════════════════════════════
  //  Resource: Metamodel JSON Schema (Phase 3)
  // ═══════════════════════════════════════════════
  server.resource(
    "metamodel-schema",
    "mmar://reference/metamodel-schema",
    {
      description: "Exact JSON structure required for mmar_create_scene_type. Use this as your template when building SceneType payloads.",
      mimeType: "application/json",
    },
    async () => ({
      contents: [{
        uri: "mmar://reference/metamodel-schema",
        mimeType: "application/json",
        text: METAMODEL_SCHEMA,
      }],
    })
  );

  // ═══════════════════════════════════════════════
  //  Resource: AttributeType Catalog (Phase 3)
  // ═══════════════════════════════════════════════
  server.resource(
    "attribute-type-catalog",
    "mmar://reference/attribute-types",
    {
      description: "Static reference of all pre-defined AttributeTypes with their semantics and recommended ui_component values. Call mmar_list_attribute_types at runtime to get current UUIDs.",
      mimeType: "text/plain",
    },
    async () => ({
      contents: [{
        uri: "mmar://reference/attribute-types",
        mimeType: "text/plain",
        text: ATTRIBUTE_TYPE_CATALOG,
      }],
    })
  );

  // ═══════════════════════════════════════════════
  //  Resource: Example Metamodel (Phase 3)
  // ═══════════════════════════════════════════════
  server.resource(
    "example-metamodel",
    "mmar://reference/example-metamodel",
    {
      description: "A complete, working Petri Net metamodel JSON payload that can be passed directly to mmar_create_scene_type. Use as a ground-truth reference for structure and geometry. NOTE: Replace AttributeType UUIDs with values from mmar_list_attribute_types.",
      mimeType: "application/json",
    },
    async () => ({
      contents: [{
        uri: "mmar://reference/example-metamodel",
        mimeType: "application/json",
        text: EXAMPLE_METAMODEL,
      }],
    })
  );
}

// ═══════════════════════════════════════════════════════════════════
//  RESOURCE CONTENT CONSTANTS
// ═══════════════════════════════════════════════════════════════════

const VIZREP_TEMPLATES = `MM-AR VizRep Geometry Templates
=================================

The "geometry" field on Classes and Relationclasses stores JavaScript code
that defines the visual representation using the gc (GraphicContext) API.

CRITICAL: If geometry is null or empty, the element CANNOT be rendered or
dragged onto the modeling canvas. Every Class and Relationclass MUST have geometry.

CRITICAL: All geometry code MUST be wrapped in the function signature:
  /** @param {GraphicContext} gc */
  async function vizRep(gc) {
    // ... your gc.* calls here ...
  }
Without this wrapper, the element will not render in the modeling client.

The code has access to:
  • gc  — GraphicContext (create shapes, text, lines)
  • gc.expression — ExpressionUtility (read attribute values at runtime)

═══════════════════════════════════════
  AVAILABLE gc.* FUNCTIONS
═══════════════════════════════════════

── Shapes ──
gc.graphic_cube(width, height, depth, color?, map?, x_rel?, y_rel?, z_rel?)
  → Creates a 3D box. Returns THREE.Mesh.

gc.graphic_plane(width, height, color?, map?, x_rel?, y_rel?, z_rel?)
  → Creates a flat rectangular plane. Returns THREE.Mesh.

gc.graphic_sphere(radius, widthSegments, heightSegments, color?, map?, x_rel?, y_rel?, z_rel?)
  → Creates a sphere. Returns THREE.Mesh.

gc.graphic_gltf(objectString, x_rel?, y_rel?, z_rel?)
  → Loads a GLTF 3D model from a string. Returns THREE.Mesh[].

── Text ──
gc.graphic_text(x_rel, y_rel, z_rel, size, color, text, pos_name_x?, pos_name_y?, pos_name_z?, rx?, ry?, rz?, rw?)
  → Creates a 3D text label. Returns Text mesh.
  → The "text" parameter can be a literal string or the result of await gc.expression.attrvalByName("AttrName")

── Buttons ──
gc.graphic_button(object, expression?)
  → Makes a shape clickable. The expression is JS code executed on click.

── Variables ──
gc.setVariable(name, value, instance_adaptable)
  → Store a variable. If instance_adaptable=true, each instance can override.

gc.getVariableValue(name)
  → Read a stored variable value.

── Relations (edges) ──
gc.rel_graphic_line(color, line_width, dashed, dash_scale, dash_size, gap_size)
  → Draw the connection line.
  → For SOLID lines: use dash_scale=0, dash_size=0, gap_size=0
  → For DASHED lines: use dashed=true, dash_scale=1, dash_size=0.3, gap_size=0.2
  → WARNING: Using dash_scale=1, dash_size=1, gap_size=1 makes the line INVISIBLE!

gc.rel_from_object(object)
  → Set the shape at the source end. Always include this (use a tiny invisible cube if no source marker needed).

gc.rel_to_object(object)
  → Set the arrow/shape at the destination end.

gc.rel_graphic_text_from(textObject) / gc.rel_graphic_text_middle(textObject) / gc.rel_graphic_text_to(textObject)
  → Add labels at from/middle/to positions on the relation line.

── Expression Utility (gc.expression.*) ──
gc.expression.attrval(metaAttrUUID)       → Get attribute value by meta-attribute UUID
gc.expression.attrvalByName(attrName)     → Get attribute value by meta-attribute name
gc.expression.attrvalByInst(attrUUID, instanceUUID)  → Get attr value from a specific instance
gc.expression.isConnected(instanceUUID)   → Check if instance has connections
gc.expression.getFile(fileUUID)           → Load a file (for images/maps)

═══════════════════════════════════════
  CLASS TEMPLATES (Node Types)
═══════════════════════════════════════

── Rectangle / Box (e.g., BPMN Task, UML Class) ──
\`\`\`javascript
/** @param {GraphicContext} gc */
async function vizRep(gc) {
  let name = await gc.expression.attrvalByName("Name") || "Unnamed";
  await gc.graphic_cube(2, 1, 0.1, "#4A90D9");
  await gc.graphic_text(0, 0, 0.06, 0.25, "white", name);
}
\`\`\`

── Circle / Sphere (e.g., Petri Net Place, State) ──
\`\`\`javascript
/** @param {GraphicContext} gc */
async function vizRep(gc) {
  let name = await gc.expression.attrvalByName("Name") || "Unnamed";
  await gc.graphic_sphere(0.6, 32, 32, "#4CAF50");
  await gc.graphic_text(0, -0.9, 0, 0.2, "black", name);
}
\`\`\`

── Narrow Rectangle / Bar (e.g., Petri Net Transition) ──
\`\`\`javascript
/** @param {GraphicContext} gc */
async function vizRep(gc) {
  let name = await gc.expression.attrvalByName("Name") || "Unnamed";
  await gc.graphic_cube(0.3, 1.2, 0.1, "#333333");
  await gc.graphic_text(0, -0.9, 0, 0.2, "black", name);
}
\`\`\`

── Diamond (e.g., BPMN Gateway, Flowchart Decision) ──
\`\`\`javascript
/** @param {GraphicContext} gc */
async function vizRep(gc) {
  let name = await gc.expression.attrvalByName("Name") || "Unnamed";
  let diamond = await gc.graphic_cube(0.8, 0.8, 0.1, "#FF9800");
  diamond.rotation.z = Math.PI / 4;
  await gc.graphic_text(0, -0.9, 0, 0.2, "black", name);
}
\`\`\`

── Flat Plane (e.g., simple card, label node) ──
\`\`\`javascript
/** @param {GraphicContext} gc */
async function vizRep(gc) {
  let name = await gc.expression.attrvalByName("Name") || "Unnamed";
  await gc.graphic_plane(2, 1.5, "#E0E0E0");
  await gc.graphic_text(0, 0, 0.01, 0.2, "black", name);
}
\`\`\`

── Ellipse / Rounded (e.g., UML Use Case) ──
\`\`\`javascript
/** @param {GraphicContext} gc */
async function vizRep(gc) {
  let name = await gc.expression.attrvalByName("Name") || "Unnamed";
  await gc.graphic_sphere(0.5, 32, 16, "#2196F3");
  await gc.graphic_text(0, -0.8, 0, 0.2, "black", name);
}
\`\`\`

── Color with Dynamic Attribute (e.g., colored by status) ──
\`\`\`javascript
/** @param {GraphicContext} gc */
async function vizRep(gc) {
  let name = await gc.expression.attrvalByName("Name") || "Unnamed";
  let color = await gc.expression.attrvalByName("Color") || "#999999";
  await gc.graphic_cube(1.5, 1, 0.1, color);
  await gc.graphic_text(0, 0, 0.06, 0.2, "white", name);
}
\`\`\`

── Two-line Label (name + secondary attribute) ──
\`\`\`javascript
/** @param {GraphicContext} gc */
async function vizRep(gc) {
  let name = await gc.expression.attrvalByName("Name") || "Unnamed";
  let desc = await gc.expression.attrvalByName("Description") || "";
  await gc.graphic_cube(2, 1.2, 0.1, "#607D8B");
  await gc.graphic_text(0, 0.2, 0.06, 0.25, "white", name);
  await gc.graphic_text(0, -0.2, 0.06, 0.15, "#CCCCCC", desc);
}
\`\`\`

═══════════════════════════════════════
  RELATIONCLASS TEMPLATES (Edge Types)
═══════════════════════════════════════

── Simple Solid Line (e.g., basic association) ──
\`\`\`javascript
/** @param {GraphicContext} gc */
async function vizRep(gc) {
  await gc.rel_graphic_line("black", 0.002, false, 0, 0, 0);
  await gc.rel_from_object(await gc.graphic_cube(0.006, 0.006, 0.006, "white"));
  await gc.rel_to_object(await gc.graphic_cube(0.006, 0.006, 0.006, "white"));
}
\`\`\`

── Directed Arrow (e.g., Petri Net Arc, flow edge) ──
\`\`\`javascript
/** @param {GraphicContext} gc */
async function vizRep(gc) {
  await gc.rel_graphic_line("black", 0.002, false, 0, 0, 0);
  let arrow = await gc.graphic_plane(0.15, 0.15, "black");
  await gc.rel_to_object(arrow);
  await gc.rel_from_object(await gc.graphic_cube(0.006, 0.006, 0.006, "white"));
}
\`\`\`

── Dashed Line (e.g., dependency, optional relation) ──
\`\`\`javascript
/** @param {GraphicContext} gc */
async function vizRep(gc) {
  await gc.rel_graphic_line("#666666", 0.002, true, 1, 0.3, 0.2);
  await gc.rel_from_object(await gc.graphic_cube(0.006, 0.006, 0.006, "white"));
  await gc.rel_to_object(await gc.graphic_cube(0.006, 0.006, 0.006, "white"));
}
\`\`\`

── Colored Line with Label ──
\`\`\`javascript
/** @param {GraphicContext} gc */
async function vizRep(gc) {
  let label = await gc.expression.attrvalByName("Name") || "";
  await gc.rel_graphic_line("#1976D2", 0.004, false, 0, 0, 0);
  let text = await gc.graphic_text(0, 0.3, 0, 0.15, "#1976D2", label);
  await gc.rel_graphic_text_middle(text);
  await gc.rel_from_object(await gc.graphic_cube(0.006, 0.006, 0.006, "white"));
  await gc.rel_to_object(await gc.graphic_cube(0.006, 0.006, 0.006, "white"));
}
\`\`\`

── Bidirectional (spheres at both ends) ──
\`\`\`javascript
/** @param {GraphicContext} gc */
async function vizRep(gc) {
  await gc.rel_graphic_line("#4CAF50", 0.003, false, 0, 0, 0);
  let fromObj = await gc.graphic_sphere(0.1, 8, 8, "#4CAF50");
  await gc.rel_from_object(fromObj);
  let toObj = await gc.graphic_sphere(0.1, 8, 8, "#4CAF50");
  await gc.rel_to_object(toObj);
}
\`\`\`

═══════════════════════════════════════
  TIPS
═══════════════════════════════════════
• WRAPPER: All geometry MUST start with: /** @param {GraphicContext} gc */ async function vizRep(gc) { ... }
• Colors: Use CSS hex strings — "#FF0000", "#4A90D9", "white", "black"
• Positioning: (0,0,0) is center. For text below a shape, use negative y.
• z_rel: Use small z offsets (0.01–0.1) to prevent z-fighting with planes.
• Line width: Typical range 0.001–0.01. The value is in meters.
• Segments: For spheres, 32 segments gives smooth circles; 8 gives octagonal.
• All gc.* functions are async — always use "await".
• SOLID lines: Use (color, width, false, 0, 0, 0). NEVER use (1, 1, 1) for solid — it makes lines invisible!
• Relations MUST call both rel_from_object() and rel_to_object(). For invisible endpoints, use a tiny white cube: gc.graphic_cube(0.006, 0.006, 0.006, "white")
• For arrow heads, use gc.graphic_plane(0.15, 0.15, color) — flat triangular markers render better than spheres.
`;

const METAMODEL_SCHEMA = JSON.stringify({
  "$comment": "Complete SceneType payload for mmar_create_scene_type. All UUIDs must be pre-generated UUIDv4.",
  "uuid": "<UUIDv4 — the SceneType ID>",
  "name": "My Modeling Language",
  "description": "Optional description",
  "classes": [
    {
      "uuid": "<UUIDv4 — unique class ID>",
      "name": "MyNodeType",
      "geometry": "/** @param {GraphicContext} gc */\nasync function vizRep(gc) {\nlet name = await gc.expression.attrvalByName(\"Name\") || \"Unnamed\";\nawait gc.graphic_cube(2, 1, 0.1, \"#4A90D9\");\nawait gc.graphic_text(0, 0, 0.06, 0.25, \"white\", name);\n}",
      "is_reusable": null,
      "is_abstract": null,
      "attributes": [
        {
          "uuid": "<UUIDv4 — unique attribute ID>",
          "name": "Name",
          "multi_valued": false,
          "default_value": "",
          "sequence": 1,
          "ui_component": "text",
          "attribute_type": {
            "uuid": "<UUID of String AttributeType — from mmar_list_attribute_types>",
            "name": "String"
          }
        }
      ],
      "ports": []
    }
  ],
  "relationclasses": [
    {
      "uuid": "<UUIDv4 — unique relationclass ID>",
      "name": "MyEdgeType",
      "geometry": "/** @param {GraphicContext} gc */\nasync function vizRep(gc) {\nawait gc.rel_graphic_line(\"black\", 0.002, false, 0, 0, 0);\nlet arrow = await gc.graphic_plane(0.15, 0.15, \"black\");\nawait gc.rel_to_object(arrow);\nawait gc.rel_from_object(await gc.graphic_cube(0.006, 0.006, 0.006, \"white\"));\n}",
      "role_from": {
        "uuid": "<UUIDv4 — unique role ID>",
        "name": "from",
        "class_references": [
          { "uuid": "<UUID of a Class in this payload>", "min": 0, "max": 100 }
        ]
      },
      "role_to": {
        "uuid": "<UUIDv4 — unique role ID>",
        "name": "to",
        "class_references": [
          { "uuid": "<UUID of a Class in this payload>", "min": 0, "max": 100 }
        ]
      },
      "attributes": [],
      "ports": []
    }
  ],
  "attributes": [],
  "ports": [],
  "procedures": []
}, null, 2);

const ATTRIBUTE_TYPE_CATALOG = `MM-AR AttributeType Catalog
=============================

IMPORTANT: These descriptions are static reference. Always call
mmar_list_attribute_types at runtime to get the actual UUIDs from your
MM-AR instance, as UUIDs may differ between installations.

┌──────────────┬──────────────────────────────────────────────────────┬────────────────┐
│ Type Name    │ Description                                          │ ui_component   │
├──────────────┼──────────────────────────────────────────────────────┼────────────────┤
│ String       │ Unicode text. Most common type for names, labels,    │ "text"         │
│              │ descriptions. Default for most attributes.            │                │
├──────────────┼──────────────────────────────────────────────────────┼────────────────┤
│ Float        │ Decimal number (e.g., 3.14, -2.5). Use for weights, │ "number"       │
│              │ costs, probabilities.                                 │                │
├──────────────┼──────────────────────────────────────────────────────┼────────────────┤
│ Integer      │ Whole number (e.g., 0, 1, 42, -7). Use for counts,  │ "number"       │
│              │ tokens, capacities.                                   │                │
├──────────────┼──────────────────────────────────────────────────────┼────────────────┤
│ Boolean      │ True/false value. MM-AR does not always list this    │ "text"         │
│              │ explicitly — check your instance.                     │                │
├──────────────┼──────────────────────────────────────────────────────┼────────────────┤
│ Enumeration  │ Fixed set of choices. The allowed values are defined │ "text"         │
│              │ via the regex_value pattern on the type.              │                │
├──────────────┼──────────────────────────────────────────────────────┼────────────────┤
│ File         │ Binary file reference (UUID). Use for images,        │ "file"         │
│              │ documents, attachments.                               │                │
├──────────────┼──────────────────────────────────────────────────────┼────────────────┤
│ Mechanism    │ Special scripting/procedure type. Use for executable  │ "text"         │
│              │ behavior definitions.                                 │                │
└──────────────┴──────────────────────────────────────────────────────┴────────────────┘

Common Patterns:
─────────────────
• "Name" attribute: String, sequence=1, ui_component="text", default_value=""
• "Description" attribute: String, sequence=2, ui_component="text", default_value=""
• "Tokens" attribute: Integer, sequence=2, ui_component="number", default_value="0"
• "Weight" attribute: Float, sequence=1, ui_component="number", default_value="1.0"
• "Color" attribute: String, sequence=3, ui_component="text", default_value="#999999"

Role Cardinality:
─────────────────
• min=0, max=100 → Zero or more connections (most common — use this as default)
• min=1, max=1   → Exactly one connection (mandatory)
• min=0, max=1   → Zero or one connection (optional)
• min=1, max=100  → One or more connections (at least one)
• WARNING: Do NOT use max=-1. While it theoretically means "unlimited", the MM-AR
  client validation rejects connections when max=-1 is used. Always use max=100 instead.
`;

const EXAMPLE_METAMODEL = JSON.stringify({
  "$comment": "Complete Petri Net metamodel — replace ATTR_TYPE_UUIDs with values from mmar_list_attribute_types",
  "uuid": "e0000001-0001-4000-8000-000000000001",
  "name": "Petri Net",
  "description": "A Petri Net modeling language with Places, Transitions, and Arcs",
  "classes": [
    {
      "uuid": "e0000001-0002-4000-8000-000000000001",
      "name": "Place",
      "geometry": "/** @param {GraphicContext} gc */\nasync function vizRep(gc) {\nlet name = await gc.expression.attrvalByName(\"Name\") || \"Place\";\nlet tokens = await gc.expression.attrvalByName(\"Tokens\") || \"0\";\nawait gc.graphic_sphere(0.6, 32, 32, \"#4CAF50\");\nawait gc.graphic_text(0, 0, 0.61, 0.2, \"white\", tokens);\nawait gc.graphic_text(0, -0.9, 0, 0.2, \"black\", name);\n}",
      "is_reusable": null,
      "is_abstract": null,
      "attributes": [
        {
          "uuid": "e0000001-0003-4000-8000-000000000001",
          "name": "Name",
          "multi_valued": false,
          "default_value": "Place",
          "sequence": 1,
          "ui_component": "text",
          "attribute_type": { "uuid": "REPLACE_WITH_STRING_UUID", "name": "String" }
        },
        {
          "uuid": "e0000001-0003-4000-8000-000000000002",
          "name": "Tokens",
          "multi_valued": false,
          "default_value": "0",
          "sequence": 2,
          "ui_component": "number",
          "attribute_type": { "uuid": "REPLACE_WITH_INTEGER_UUID", "name": "Integer" }
        }
      ],
      "ports": []
    },
    {
      "uuid": "e0000001-0002-4000-8000-000000000002",
      "name": "Transition",
      "geometry": "/** @param {GraphicContext} gc */\nasync function vizRep(gc) {\nlet name = await gc.expression.attrvalByName(\"Name\") || \"Transition\";\nawait gc.graphic_cube(0.3, 1.2, 0.1, \"#333333\");\nawait gc.graphic_text(0, -0.9, 0, 0.2, \"black\", name);\n}",
      "is_reusable": null,
      "is_abstract": null,
      "attributes": [
        {
          "uuid": "e0000001-0003-4000-8000-000000000003",
          "name": "Name",
          "multi_valued": false,
          "default_value": "Transition",
          "sequence": 1,
          "ui_component": "text",
          "attribute_type": { "uuid": "REPLACE_WITH_STRING_UUID", "name": "String" }
        }
      ],
      "ports": []
    }
  ],
  "relationclasses": [
    {
      "uuid": "e0000001-0004-4000-8000-000000000001",
      "name": "Arc",
      "geometry": "/** @param {GraphicContext} gc */\nasync function vizRep(gc) {\nawait gc.rel_graphic_line(\"black\", 0.002, false, 0, 0, 0);\nlet arrow = await gc.graphic_plane(0.15, 0.15, \"black\");\nawait gc.rel_to_object(arrow);\nawait gc.rel_from_object(await gc.graphic_cube(0.006, 0.006, 0.006, \"white\"));\n}",
      "role_from": {
        "uuid": "e0000001-0005-4000-8000-000000000001",
        "name": "from",
        "class_references": [
          { "uuid": "e0000001-0002-4000-8000-000000000001", "min": 0, "max": 100 },
          { "uuid": "e0000001-0002-4000-8000-000000000002", "min": 0, "max": 100 }
        ]
      },
      "role_to": {
        "uuid": "e0000001-0005-4000-8000-000000000002",
        "name": "to",
        "class_references": [
          { "uuid": "e0000001-0002-4000-8000-000000000001", "min": 0, "max": 100 },
          { "uuid": "e0000001-0002-4000-8000-000000000002", "min": 0, "max": 100 }
        ]
      },
      "attributes": [
        {
          "uuid": "e0000001-0003-4000-8000-000000000004",
          "name": "Weight",
          "multi_valued": false,
          "default_value": "1",
          "sequence": 1,
          "ui_component": "number",
          "attribute_type": { "uuid": "REPLACE_WITH_INTEGER_UUID", "name": "Integer" }
        }
      ],
      "ports": []
    }
  ],
  "attributes": [],
  "ports": [],
  "procedures": []
}, null, 2);
