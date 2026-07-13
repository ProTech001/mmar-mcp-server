# Experiment Log — MMAR-MCP Evaluation

## Metadata
- **Operator:** Prosper Ukoma Chima
- **MCP Host:** Cursor IDE
- **LLM:** Claude (Anthropic) via Cursor
- **MCP Server:** MMAR-MCP v1.0.0 (STDIO)
- **Platform:** MM-AR (localhost:8000, PostgreSQL)
- **Date Range:** June 2026

---

## Phase 1: Metamodel Experiments

### Meta-1a — Petri Net Metamodel, Trial 1
- **Date:** 2026-06-17
- **Time Started:** 12:45 (UTC+2)
- **Time Completed:** 12:47 (UTC+2)
- **Duration:** ~2 min
- **Status:** SUCCESS
- **Errors:** None
- **JSON saved:** `results/metamodel/Meta-1a.json`
- **Screenshot:** `screenshots/Meta-1a.png`
- **Results:**
  - Classes: Place (Name/String, Tokens/Integer), Transition (Name/String) — **2/2 correct**
  - Relation Classes: Arc (Weight/Integer) — **1/1 correct**
  - Roles: from→[Place,Transition], to→[Place,Transition] — **correct**
  - VizRep: All 3 elements have geometry — **all valid**

### Meta-1b — Petri Net Metamodel, Trial 2
- **Date:** 2026-06-17
- **Time Started:** 12:57 (UTC+2)
- **Time Completed:** 13:00 (UTC+2)
- **Duration:** ~3 min
- **Status:** SUCCESS
- **Errors:** None
- **JSON saved:** `results/metamodel/Meta-1b.json`
- **Screenshot:** `screenshots/Meta-1b.png`
- **Results:**
  - Classes: Place (Name/String, Tokens/Integer), Transition (Name/String) — **2/2 correct**
  - Relation Classes: Arc (Weight/Integer) — **1/1 correct**
  - VizRep: All 3 elements have geometry — **all valid**

### Meta-1c — Petri Net Metamodel, Trial 3
- **Date:** 2026-06-17
- **Time Started:** 13:06 (UTC+2)
- **Time Completed:** 13:08 (UTC+2)
- **Duration:** ~2 min
- **Status:** SUCCESS
- **Errors:** None
- **JSON saved:** `results/metamodel/Meta-1c.json`
- **Screenshot:** `screenshots/Meta-1c.png`
- **Results:**
  - Classes: Place (Name/String, Tokens/Integer), Transition (Name/String) — **2/2 correct**
  - Relation Classes: Arc (Weight/Integer) — **1/1 correct**
  - VizRep: All 3 elements have geometry — **all valid**

### Meta-2a — ER Diagram Metamodel, Trial 1
- **Date:** 2026-06-17
- **Time Started:** 13:24 (UTC+2)
- **Time Completed:** 13:26 (UTC+2)
- **Duration:** ~2 min
- **Status:** SUCCESS
- **Errors:** None
- **JSON saved:** `results/metamodel/Meta-2a.json`
- **Screenshot:** (skipped)
- **Results:**
  - Classes: Entity (Name/String), Attribute (Name/String, DataType/String, IsPrimaryKey/String*), Relationship (Name/String, Cardinality/String) — **3/3 correct**
  - Relation Classes: HasAttribute, Participates — **2/2 correct**
  - VizRep: All 5 elements have geometry — **all valid**
  - **Issue:** IsPrimaryKey generated as String instead of Boolean (minor type mismatch)

### Meta-2b — ER Diagram Metamodel, Trial 2
- **Date:** 2026-06-17
- **Time Started:** 13:28 (UTC+2)
- **Time Completed:** 13:30 (UTC+2)
- **Duration:** ~2 min
- **Status:** SUCCESS
- **Errors:** None
- **JSON saved:** `results/metamodel/Meta-2b.json`
- **Screenshot:** (skipped)
- **Results:**
  - Classes: Entity (Name/String), Attribute (Name/String, DataType/String, IsPrimaryKey/String*), Relationship (Name/String, Cardinality/String) — **3/3 correct**
  - Relation Classes: HasAttribute, Participates — **2/2 correct**
  - VizRep: All 5 elements have geometry — **all valid**
  - **Issue:** IsPrimaryKey generated as String instead of Boolean (same as Meta-2a — consistent deviation)

### Meta-2c — ER Diagram Metamodel, Trial 3
- **Date:** 2026-06-17
- **Time Started:** 13:32 (UTC+2)
- **Time Completed:** 13:35 (UTC+2)
- **Duration:** ~3 min
- **Status:** SUCCESS
- **Errors:** None
- **JSON saved:** `results/metamodel/Meta-2c.json`
- **Screenshot:** (skipped)
- **Results:**
  - Classes: Entity (Name/String), Attribute (Name/String, DataType/String, IsPrimaryKey/String*), Relationship (Name/String, Cardinality/String) — **3/3 correct**
  - Relation Classes: HasAttribute, Participates — **2/2 correct**
  - VizRep: All 5 elements have geometry — **all valid**
  - **Issue:** IsPrimaryKey generated as String instead of Boolean (consistent across all 3 ER trials)

### Meta-3a — Flowchart Metamodel, Trial 1
- **Date:** 2026-06-17
- **Time Started:** 13:40 (UTC+2)
- **Time Completed:** 13:42 (UTC+2)
- **Duration:** ~2 min
- **Status:** SUCCESS
- **Errors:** None
- **JSON saved:** `results/metamodel/Meta-3a.json`
- **Screenshot:** (skipped)
- **Results:**
  - Classes: Start (none), End (none), Process (Name/String, Description/String), Decision (Condition/String) — **4/4 correct**
  - Relation Classes: Flow (Label/String) — **1/1 correct**
  - VizRep: All 5 elements have geometry — **all valid**
  - **Perfect match against baseline**

### Meta-3b — Flowchart Metamodel, Trial 2
- **Date:** 2026-06-17
- **Time Started:** 13:57 (UTC+2)
- **Time Completed:** 13:59 (UTC+2)
- **Duration:** ~2 min
- **Status:** SUCCESS
- **Errors:** None
- **JSON saved:** `results/metamodel/Meta-3b.json`
- **Screenshot:** (skipped)
- **Results:**
  - Classes: Start (none), End (none), Process (Name/String, Description/String), Decision (Condition/String) — **4/4 correct**
  - Relation Classes: Flow (Label/String) — **1/1 correct**
  - VizRep: All 5 elements have geometry — **all valid**
  - **Perfect match against baseline**

### Meta-3c — Flowchart Metamodel, Trial 3
- **Date:** 2026-06-17
- **Time Started:** 14:00 (UTC+2)
- **Time Completed:** 14:02 (UTC+2)
- **Duration:** ~2 min
- **Status:** SUCCESS
- **Errors:** None
- **JSON saved:** `results/metamodel/Meta-3c.json`
- **Screenshot:** (skipped)
- **Results:**
  - Classes: Start (none), End (none), Process (Name/String, Description/String), Decision (Condition/String) — **4/4 correct**
  - Relation Classes: Flow (Label/String) — **1/1 correct**
  - VizRep: All 5 elements have geometry — **all valid**
  - **Perfect match against baseline**

### Meta-4a — State Machine Metamodel, Trial 1
- **Date:** 2026-06-17
- **Time Started:** 14:06 (UTC+2)
- **Time Completed:** 14:08 (UTC+2)
- **Duration:** ~2 min
- **Status:** SUCCESS
- **Errors:** None
- **JSON saved:** `results/metamodel/Meta-4a.json`
- **Screenshot:** (skipped)
- **Results:**
  - Classes: State (Name/String, IsInitial/String*, IsFinal/String*) — **1/1 correct**
  - Relation Classes: Transition (Event/String, Guard/String, Action/String) — **1/1 correct**
  - VizRep: All 2 elements have geometry — **all valid**
  - **Issue:** IsInitial and IsFinal generated as String instead of Boolean (same pattern as ER Diagram IsPrimaryKey)

### Meta-4b — State Machine Metamodel, Trial 2
- **Date:** 2026-06-17
- **Time Started:** 20:05 (UTC+2)
- **Time Completed:** 20:07 (UTC+2)
- **Duration:** ~2 min
- **Status:** SUCCESS
- **Errors:** None
- **JSON saved:** `results/metamodel/Meta-4b.json`
- **Screenshot:** (skipped)
- **Results:**
  - Classes: State (Name/String, IsInitial/String*, IsFinal/String*) — **1/1 correct**
  - Relation Classes: Transition (Event/String, Guard/String, Action/String) — **1/1 correct**
  - VizRep: All 2 elements have geometry — **all valid**
  - **Issue:** IsInitial and IsFinal generated as String instead of Boolean (consistent across trials)

### Meta-4c — State Machine Metamodel, Trial 3
- **Date:** 2026-06-17
- **Time Started:** 20:08 (UTC+2)
- **Time Completed:** 20:10 (UTC+2)
- **Duration:** ~2 min
- **Status:** SUCCESS
- **Errors:** None
- **JSON saved:** `results/metamodel/Meta-4c.json`
- **Screenshot:** (skipped)
- **Results:**
  - Classes: State (Name/String, IsInitial/String*, IsFinal/String*) — **1/1 correct**
  - Relation Classes: Transition (Event/String, Guard/String, Action/String) — **1/1 correct**
  - VizRep: All 2 elements have geometry — **all valid**
  - **Issue:** IsInitial and IsFinal generated as String instead of Boolean (consistent across all 3 trials)

---

## Phase 2: Instance Experiments

### Inst-1a — Petri Net Instance (Producer-Consumer), Trial 1
- **Date:** Monday Jun 22, 2026
- **Time Started:** 11:19 AM (UTC+2)
- **Time Completed:** 11:23 AM (UTC+2)
- **Duration:** ~4 min
- **Status:** SUCCESS
- **Base metamodel:** Petri Net Trial 3 (Meta-1c leftover)
- **Errors:** None
- **JSON saved:** `results/instance/Inst-1a.json`
- **Screenshot:** Skipped
- **Result Summary:**
  - Class instances: 5 (3 Places: Producer/Buffer/Consumer, 2 Transitions: Produce/Consume) — all correct
  - Relation instances: 4 arcs (Producer→Produce, Produce→Buffer, Buffer→Consume, Consume→Consumer) — all correct
  - Tokens: Producer=3, Buffer=0, Consumer=0 — all correct
  - **Precision: 1.0 | Recall: 1.0 | F1: 1.0** (perfect match)

### Inst-1b — Petri Net Instance (Producer-Consumer), Trial 2
- **Date:** Monday Jun 22, 2026
- **Time Started:** 11:28 AM (UTC+2)
- **Time Completed:** 11:33 AM (UTC+2)
- **Duration:** ~5 min
- **Status:** SUCCESS
- **Base metamodel:** Petri Net Trial 3 (Meta-1c leftover)
- **Errors:** None
- **JSON saved:** `results/instance/Inst-1b.json`
- **Screenshot:** Skipped
- **Result Summary:**
  - Class instances: 5 (3 Places: Producer/Buffer/Consumer, 2 Transitions: Produce/Consume) — all correct
  - Relation instances: 4 arcs (Producer→Produce, Produce→Buffer, Buffer→Consume, Consume→Consumer) — all correct
  - Tokens: Producer=3, Buffer=0, Consumer=0 — all correct
  - **Precision: 1.0 | Recall: 1.0 | F1: 1.0** (perfect match)

### Inst-1c — Petri Net Instance (Producer-Consumer), Trial 3
- **Date:** Monday Jun 22, 2026
- **Time Started:** 11:35 AM (UTC+2)
- **Time Completed:** 11:39 AM (UTC+2)
- **Duration:** ~4 min
- **Status:** PARTIAL SUCCESS
- **Base metamodel:** Petri Net Trial 3 (Meta-1c leftover)
- **Errors:** Relation instances (arcs) were not created — 0 of 4 arcs generated
- **JSON saved:** `results/instance/Inst-1c.json`
- **Screenshot:** Skipped
- **Result Summary:**
  - Class instances: 5 (3 Places: Producer/Buffer/Consumer, 2 Transitions: Produce/Consume) — all correct
  - Relation instances: 0 of 4 arcs — **MISSING** (Producer→Produce, Produce→Buffer, Buffer→Consume, Consume→Consumer)
  - Tokens: Producer=3, Buffer=0, Consumer=0 — all correct
  - **Precision: 1.0 | Recall: 5/9 = 0.556 | F1: 0.714** (class instances perfect, all relations missing)

### Inst-2a — ER Diagram Instance (Student-Course), Trial 1
- **Date:** Monday Jun 22, 2026
- **Time Started:** 1:23 PM (UTC+2)
- **Time Completed:** 1:28 PM (UTC+2)
- **Duration:** ~5 min
- **Status:** SUCCESS
- **Base metamodel:** ER Diagram
- **Errors:** None
- **JSON saved:** `results/instance/Inst-2a.json`
- **Screenshot:** Skipped
- **Result Summary:**
  - Class instances: 6 (Student, Course, StudentName [PK], StudentID, CourseName [PK], Enrolled [M:N]) — all correct
  - Relation instances: 5 (3 HasAttribute + 2 Participates) — all correct
  - **Precision: 1.0 | Recall: 1.0 | F1: 1.0** (perfect match)

### Inst-2b — ER Diagram Instance (Student-Course), Trial 2
- **Date:** Monday Jun 22, 2026
- **Time Started:** 1:31 PM (UTC+2)
- **Time Completed:** 1:35 PM (UTC+2)
- **Duration:** ~4 min
- **Status:** SUCCESS
- **Base metamodel:** ER Diagram
- **Errors:** None
- **JSON saved:** `results/instance/Inst-2b.json`
- **Screenshot:** Skipped
- **Result Summary:**
  - Class instances: 6 (Student, Course, StudentName [PK], StudentID, CourseName [PK], Enrolled [M:N]) — all correct
  - Relation instances: 5 (3 HasAttribute + 2 Participates) — all correct
  - **Precision: 1.0 | Recall: 1.0 | F1: 1.0** (perfect match)

### Inst-2c — ER Diagram Instance (Student-Course), Trial 3
- **Date:** Monday Jun 22, 2026
- **Time Started:** 1:37 PM (UTC+2)
- **Time Completed:** 1:43 PM (UTC+2)
- **Duration:** ~6 min
- **Status:** SUCCESS
- **Base metamodel:** ER Diagram
- **Errors:** None (line_points empty on relations but structure correct)
- **JSON saved:** `results/instance/Inst-2c.json`
- **Screenshot:** Skipped
- **Result Summary:**
  - Class instances: 6 (Student, Course, StudentName [PK], StudentID, CourseName [PK], Enrolled [M:N]) — all correct
  - Relation instances: 5 (3 HasAttribute + 2 Participates) — all correct (line_points empty)
  - **Precision: 1.0 | Recall: 1.0 | F1: 1.0** (perfect match)

### Inst-3a — Flowchart Instance (Order Processing), Trial 1
- **Date:** Tuesday Jun 23, 2026
- **Time Started:** 9:37 AM (UTC+2)
- **Time Completed:** 9:44 AM (UTC+2)
- **Duration:** ~7 min
- **Status:** SUCCESS
- **Base metamodel:** Flowchart
- **Errors:** None (line_points empty on relations)
- **JSON saved:** `results/instance/Inst-3a.json`
- **Screenshot:** Skipped
- **Result Summary:**
  - Class instances: 6 (Start, Receive Order, Check Stock, Ship Order, Backorder, End) — all correct
  - Relation instances: 6 flows — all correct
  - **Precision: 1.0 | Recall: 1.0 | F1: 1.0** (perfect match)

### Inst-3b — Flowchart Instance (Order Processing), Trial 2
- **Date:** Tuesday Jun 23, 2026
- **Time Started:** 10:20 AM (UTC+2)
- **Time Completed:** 10:25 AM (UTC+2)
- **Duration:** ~5 min
- **Status:** SUCCESS
- **Base metamodel:** Flowchart
- **Errors:** None
- **JSON saved:** `results/instance/Inst-3b.json`
- **Screenshot:** Skipped
- **Result Summary:**
  - Class instances: 6 (Start, Receive Order, Check Stock, Ship Order, Backorder, End) — all correct
  - Relation instances: 6 flows — all correct
  - **Precision: 1.0 | Recall: 1.0 | F1: 1.0** (perfect match)

### Inst-3c — Flowchart Instance (Order Processing), Trial 3
- **Date:** Tuesday Jun 23, 2026
- **Time Started:** 10:27 AM (UTC+2)
- **Time Completed:** 10:33 AM (UTC+2)
- **Duration:** ~6 min
- **Status:** SUCCESS
- **Base metamodel:** Flowchart
- **Errors:** None
- **JSON saved:** `results/instance/Inst-3c.json`
- **Screenshot:** Skipped
- **Result Summary:**
  - Class instances: 6 (Start, Receive Order, Check Stock, Ship Order, Backorder, End) — all correct
  - Relation instances: 6 flows — all correct
  - **Precision: 1.0 | Recall: 1.0 | F1: 1.0** (perfect match)

### Inst-4a — State Machine Instance (Traffic Light), Trial 1
- **Date:** Tuesday Jun 23, 2026
- **Time Started:** 10:36 AM (UTC+2)
- **Time Completed:** 10:41 AM (UTC+2)
- **Duration:** ~5 min
- **Status:** SUCCESS
- **Base metamodel:** State Machine Trial 3
- **Errors:** None
- **JSON saved:** `results/instance/Inst-4a.json`
- **Screenshot:** Skipped
- **Result Summary:**
  - Class instances: 4 (Red [initial], Green, Yellow, Final [final]) — all correct per prompt
  - Relation instances: 4 transitions (Red→Green, Green→Yellow, Yellow→Red, Red→Final) — all correct
  - Note: Prompt specifies 4 states + 4 transitions (expanded from baseline's 3+3 to include Final state and shutdown transition)
  - **Precision: 1.0 | Recall: 1.0 | F1: 1.0** (perfect match against prompt specification)

### Inst-4b — State Machine Instance (Traffic Light), Trial 2
- **Date:** Tuesday Jun 23, 2026
- **Time Started:** 10:52 AM (UTC+2)
- **Time Completed:** 10:57 AM (UTC+2)
- **Duration:** ~5 min
- **Status:** SUCCESS
- **Base metamodel:** State Machine Trial 3
- **Errors:** None
- **JSON saved:** `results/instance/Inst-4b.json`
- **Screenshot:** Skipped
- **Result Summary:**
  - Class instances: 4 (Red [initial], Green, Yellow, Final [final]) — all correct
  - Relation instances: 4 transitions (Red→Green, Green→Yellow, Yellow→Red, Red→Final) — all correct
  - **Precision: 1.0 | Recall: 1.0 | F1: 1.0** (perfect match)

### Inst-4c — State Machine Instance (Traffic Light), Trial 3
- **Date:** Tuesday Jun 23, 2026
- **Time Started:** 11:00 AM (UTC+2)
- **Time Completed:** 11:05 AM (UTC+2)
- **Duration:** ~5 min
- **Status:** SUCCESS
- **Base metamodel:** State Machine Trial 3
- **Errors:** None
- **JSON saved:** `results/instance/Inst-4c.json`
- **Screenshot:** Skipped
- **Result Summary:**
  - Class instances: 4 (Red [initial], Green, Yellow, Final [final]) — all correct
  - Relation instances: 4 transitions (Red→Green, Green→Yellow, Yellow→Red, Red→Final) — all correct
  - **Precision: 1.0 | Recall: 1.0 | F1: 1.0** (perfect match)
