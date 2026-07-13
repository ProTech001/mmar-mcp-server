# Experiment Guide — MMAR-MCP Evaluation

## Overview

We run **24 experiments** to systematically evaluate LLM-based metamodel and model instance creation:
- **4 modeling languages**: Petri Net, ER Diagram, Flowchart, State Machine
- **2 levels**: metamodel creation + instance creation
- **3 trials each**: to assess output stability

---

## Prerequisites

### 1. Start the MM-AR Platform
```bash
# Start PostgreSQL (if using Docker)
docker start mmar-postgres

# Start the MM-AR API server (port 8000)
cd mmar-server && npm start

# Start the Metamodeling Client (port 8070)
cd mmar-metamodeling-client && npm start

# Start the Modeling Client (port 8060)
cd mmar-modeling-client && npm start
```

Verify all services:
- API: http://localhost:8000
- Metamodeling Client: http://localhost:8070
- Modeling Client: http://localhost:8060

### 2. Ensure the MCP Server is connected in Cursor
The MMAR-MCP server should appear in Cursor's MCP tools panel.

---

## Ground-Truth Baselines

These define what a **correct** output looks like for each modeling language.

### Petri Net Metamodel Baseline
| Element Type | Expected Elements |
|---|---|
| Classes | Place, Transition |
| Attributes (Place) | Name/String, Tokens/Integer |
| Attributes (Transition) | Name/String |
| Relation Classes | Arc |
| Attributes (Arc) | Weight/Integer |
| Roles | Arc→from (Place OR Transition), Arc→to (Place OR Transition) |
| VizRep | Place=sphere, Transition=bar/rectangle, Arc=arrow line |

### ER Diagram Metamodel Baseline
| Element Type | Expected Elements |
|---|---|
| Classes | Entity, Attribute, Relationship |
| Attributes (Entity) | Name/String |
| Attributes (Attribute) | Name/String, DataType/String, IsPrimaryKey/Boolean |
| Attributes (Relationship) | Name/String, Cardinality/String |
| Relation Classes | HasAttribute (Entity→Attribute), Participates (Entity→Relationship) |
| VizRep | Entity=rectangle, Attribute=ellipse/sphere, Relationship=diamond |

### Flowchart Metamodel Baseline
| Element Type | Expected Elements |
|---|---|
| Classes | Start, End, Process, Decision |
| Attributes (Process) | Name/String, Description/String |
| Attributes (Decision) | Condition/String |
| Relation Classes | Flow |
| Attributes (Flow) | Label/String |
| Roles | Flow→from (any class), Flow→to (any class) |
| VizRep | Start=green circle, End=red circle, Process=blue rectangle, Decision=yellow diamond, Flow=arrow |

### State Machine Metamodel Baseline
| Element Type | Expected Elements |
|---|---|
| Classes | State, FinalState (or State with IsFinal attribute) |
| Attributes (State) | Name/String, IsInitial/Boolean, IsFinal/Boolean |
| Relation Classes | Transition |
| Attributes (Transition) | Event/String, Guard/String (optional), Action/String (optional) |
| Roles | Transition→from (State), Transition→to (State) |
| VizRep | State=circle/sphere, Transition=arrow line with label |

---

### Petri Net Instance Baseline (Producer-Consumer)
| Element Type | Expected Elements |
|---|---|
| Class Instances | Producer (Place, Tokens=3), Buffer (Place, Tokens=0), Consumer (Place, Tokens=0), Produce (Transition), Consume (Transition) |
| Relation Instances | Arc: Producer→Produce, Produce→Buffer, Buffer→Consume, Consume→Consumer |
| Total | 5 class instances, 4 relation instances |

### ER Diagram Instance Baseline (Student-Course)
| Element Type | Expected Elements |
|---|---|
| Class Instances | Student (Entity), Course (Entity), StudentName (Attribute, PK), StudentID (Attribute), CourseName (Attribute, PK), Enrolled (Relationship) |
| Relation Instances | Student→StudentName, Student→StudentID, Course→CourseName, Student→Enrolled, Course→Enrolled |
| Total | 6 class instances, 5 relation instances |

### Flowchart Instance Baseline (Order Processing)
| Element Type | Expected Elements |
|---|---|
| Class Instances | Start, Receive Order (Process), Check Stock (Decision), Ship Order (Process), Backorder (Process), End |
| Relation Instances | Start→Receive, Receive→Check, Check→Ship (Yes), Check→Backorder (No), Ship→End, Backorder→End |
| Total | 6 class instances, 6 relation instances |

### State Machine Instance Baseline (Traffic Light)
| Element Type | Expected Elements |
|---|---|
| Class Instances | Green (State, IsInitial=true), Yellow (State), Red (State) |
| Relation Instances | Green→Yellow (timer), Yellow→Red (timer), Red→Green (timer) |
| Total | 3 class instances, 3 relation instances |

---

## How to Run Each Experiment

### Step-by-Step Procedure

For EACH of the 24 experiments:

**A. Before the experiment:**
1. Open a **new Cursor chat** (fresh context, no prior history)
2. Note the current time

**B. Run the metamodel experiment:**
Use this EXACT prompt format:
```
Use the create-metamodel prompt with:
- language_name: "[Language Name] Trial [N]"
- description: "[See prompts below]"
```

**C. Run the instance experiment:**
Use this EXACT prompt format:
```
Use the create-model prompt with:
- scene_type_name: "[Language Name] Trial [N]"
- model_description: "[See prompts below]"
```

**D. After the experiment:**
1. Copy the **full Cursor chat log** (all tool calls and responses)
2. Call `mmar_get_scene_type` (for metamodel) or `mmar_get_scene_instance` (for instance) and **save the full JSON output**
3. Take a **screenshot** of the result in the MM-AR client
4. Record any **errors** the LLM encountered and how it handled them

---

## Exact Prompts to Use

### Metamodel Prompts (use the SAME prompt for all 3 trials of each language)

**Petri Net:**
```
Create a Petri Net modeling language. It should have Place nodes (green spheres with a
Tokens/Integer attribute and Name/String), Transition nodes (dark rectangular bars with a
Name/String attribute), and Arc connections (arrow lines with a Weight/Integer attribute).
Arcs connect Places to Transitions and Transitions to Places.
```

**ER Diagram:**
```
Create an ER Diagram modeling language. It should have Entity nodes (blue rectangles with
Name/String), Attribute nodes (green spheres with Name/String, DataType/String, and
IsPrimaryKey/Boolean), and Relationship nodes (orange diamonds with Name/String and
Cardinality/String). Entities connect to Attributes via HasAttribute links (dashed gray
lines), and Entities connect to Relationships via Participates links (solid black lines).
```

**Flowchart:**
```
Create a Flowchart modeling language. It should have Start nodes (green circles),
End nodes (red circles), Process nodes (blue rectangles with Name/String and
Description/String), and Decision nodes (yellow diamonds with Condition/String).
All node types are connected by Flow connections (solid arrow lines with an optional
Label/String attribute).
```

**State Machine:**
```
Create a State Machine modeling language. It should have State nodes (circles/spheres
with Name/String, IsInitial/Boolean, and IsFinal/Boolean attributes). States are
connected by Transition edges (arrow lines with Event/String, Guard/String, and
Action/String attributes).
```

### Instance Prompts (use the SAME prompt for all 3 trials)

**Petri Net — Producer-Consumer:**
```
Model a producer-consumer system: A Producer place with 3 tokens, a Buffer place
with 0 tokens, a Consumer place with 0 tokens, a Produce transition between Producer
and Buffer, and a Consume transition between Buffer and Consumer. Connect them with
Arcs: Producer→Produce, Produce→Buffer, Buffer→Consume, Consume→Consumer.
```

**ER Diagram — Student-Course:**
```
Model a university enrollment system: A Student entity with attributes StudentName
(primary key) and StudentID. A Course entity with attribute CourseName (primary key).
An Enrolled relationship connecting Student and Course. Connect entities to their
attributes via HasAttribute, and both Student and Course to the Enrolled relationship
via Participates.
```

**Flowchart — Order Processing:**
```
Model an order processing workflow: Start → Receive Order (process) → Check Stock
(decision) → if yes: Ship Order (process) → End; if no: Backorder (process) → End.
Label the decision branches "In Stock" and "Out of Stock".
```

**State Machine — Traffic Light:**
```
Model a traffic light controller with three states: Green (initial state), Yellow,
and Red. Transitions: Green→Yellow (event: "timer"), Yellow→Red (event: "timer"),
Red→Green (event: "timer"). This is a cyclic state machine.
```

---

## Recording Template

For each experiment, record in the corresponding JSON file:

```json
{
  "experiment_id": "Meta-1a",
  "language": "Petri Net",
  "level": "metamodel",
  "trial": 1,
  "date": "2026-06-XX",
  "time_started": "HH:MM",
  "time_completed": "HH:MM",
  "prompt_used": "[exact prompt text]",
  "tool_calls": [
    { "tool": "mmar_login", "success": true },
    { "tool": "mmar_list_attribute_types", "success": true },
    { "tool": "mmar_create_scene_type", "success": true },
    { "tool": "mmar_get_scene_type", "success": true }
  ],
  "errors_encountered": [],
  "retries": 0,
  "result_json": "[paste full JSON from mmar_get_scene_type]",
  "screenshot": "experiments/screenshots/Meta-1a.png",
  "evaluation": {
    "classes": { "expected": ["Place", "Transition"], "generated": [], "TP": 0, "FP": 0, "FN": 0 },
    "attributes": { "expected": [], "generated": [], "TP": 0, "FP": 0, "FN": 0 },
    "relation_classes": { "expected": ["Arc"], "generated": [], "TP": 0, "FP": 0, "FN": 0 },
    "roles_correct": true,
    "vizrep_valid": true,
    "notes": ""
  }
}
```

---

## Evaluation Metrics (computed after all experiments)

For each element type, compute:

| Metric | Formula |
|--------|---------|
| **Precision** | TP / (TP + FP) |
| **Recall** | TP / (TP + FN) |
| **F1 Score** | 2 × (P × R) / (P + R) |

Where:
- **TP** (True Positive) = element in baseline AND in generated output (correct match)
- **FP** (False Positive) = element in generated output but NOT in baseline (hallucination/extra)
- **FN** (False Negative) = element in baseline but NOT in generated output (missing)

**Matching rules:**
- **Classes**: Match by semantic name (case-insensitive, e.g., "Place" = "place")
- **Attributes**: Match by (parent class + attribute name + attribute type)
- **Relation Classes**: Match by semantic name
- **Roles**: Match by (relation class + referenced classes)
- **Instances**: Match by (meta-class + name/identifying attribute value)

---

## Experiment Execution Order

### Phase 1: Metamodel Experiments (12 runs)
```
Meta-1a  Petri Net metamodel, trial 1
Meta-1b  Petri Net metamodel, trial 2
Meta-1c  Petri Net metamodel, trial 3
Meta-2a  ER Diagram metamodel, trial 1
Meta-2b  ER Diagram metamodel, trial 2
Meta-2c  ER Diagram metamodel, trial 3
Meta-3a  Flowchart metamodel, trial 1
Meta-3b  Flowchart metamodel, trial 2
Meta-3c  Flowchart metamodel, trial 3
Meta-4a  State Machine metamodel, trial 1
Meta-4b  State Machine metamodel, trial 2
Meta-4c  State Machine metamodel, trial 3
```

### Phase 2: Instance Experiments (12 runs)
Use the **Trial 1 metamodel** from Phase 1 as the base for all 3 instance trials:
```
Inst-1a  Petri Net instance (on Meta-1a), trial 1
Inst-1b  Petri Net instance (on Meta-1a), trial 2
Inst-1c  Petri Net instance (on Meta-1a), trial 3
Inst-2a  ER Diagram instance (on Meta-2a), trial 1
Inst-2b  ER Diagram instance (on Meta-2a), trial 2
Inst-2c  ER Diagram instance (on Meta-2a), trial 3
Inst-3a  Flowchart instance (on Meta-3a), trial 1
Inst-3b  Flowchart instance (on Meta-3a), trial 2
Inst-3c  Flowchart instance (on Meta-3a), trial 3
Inst-4a  State Machine instance (on Meta-4a), trial 1
Inst-4b  State Machine instance (on Meta-4a), trial 2
Inst-4c  State Machine instance (on Meta-4a), trial 3
```

---

## Important Notes

1. **Fresh chat for each experiment** — no context carryover between trials
2. **Same prompt** for all 3 trials of the same language — this tests stability
3. **Do NOT intervene** — let the LLM complete the task autonomously; only observe
4. **Record everything** — even failed attempts are valuable data
5. **Delete metamodels between trials** — each trial must create from scratch
   - For Meta-Xb and Meta-Xc, delete the previous trial's metamodel first
   - For instance experiments, keep Meta-Xa as the shared base
6. **Screenshots** — take one of the Metamodeling Client (for metamodels) or Modeling Client (for instances) after each experiment
