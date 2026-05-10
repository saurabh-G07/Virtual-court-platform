# Valura AI Microservice - System Architecture Design

Based on the provided `ASSIGNMENT.md`, `assignment_analysis.md`, and `implementation_plan.md`, as well as the reference Figma architecture components (Clean Architecture, Multiplayer Community), here is the detailed system design for the Valura AI Microservice. 

> **Note:** As an AI, I cannot directly generate proprietary `.fig` files. However, I have structured this document as a direct **Figma Blueprint**. You can use the Mermaid diagram below to auto-generate the base structure in Figma using plugins like "Mermaid to Figma", and follow the layout/styling guide to match the clean architecture references you provided.

## 1. System Architecture Diagram (Mermaid)

You can copy and paste this code into a Mermaid-to-Figma plugin or view it in any Markdown previewer.

```mermaid
graph TD
    %% Styling
    classDef client fill:#f9f9fa,stroke:#d0d0d5,stroke-width:2px,color:#333;
    classDef api fill:#e1f5fe,stroke:#0288d1,stroke-width:2px,color:#01579b;
    classDef core fill:#fff3e0,stroke:#f57c00,stroke-width:2px,color:#e65100;
    classDef agent fill:#e8f5e9,stroke:#388e3c,stroke-width:2px,color:#1b5e20;
    classDef data fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px,color:#4a148c;
    classDef llm fill:#e0f7fa,stroke:#0097a7,stroke-width:2px,color:#006064;

    %% Nodes
    Client["📱 User Client"]:::client
    
    subgraph "API Layer (HTTP Layer)"
        FastAPI["🚀 FastAPI Endpoint<br>(HTTP & SSE Streaming)"]:::api
    end
    
    subgraph "Data & State Layer"
        Session["🗄️ Bounded Session Memory<br>(In-Memory Dict)"]:::data
        UserData["👤 User Profile Data<br>(Pydantic Models)"]:::data
        MockData["📊 Mock Market Data<br>(Fixed FX, Deterministic)"]:::data
    end

    subgraph "Core Execution Pipeline"
        SafetyGuard["🛡️ Safety Guard<br>(Sync, Rule-Based, <10ms)"]:::core
        IntentClassifier["🧠 Intent Classifier<br>(Single LLM Call)"]:::core
        LLM["🤖 GPT-4o-mini<br>(Strict JSON Schema)"]:::llm
        Router["🚦 Agent Router<br>(Deterministic Routing)"]:::core
    end
    
    subgraph "Agent Layer (Plug-and-Play)"
        PortHealth["🏥 Portfolio Health Agent<br>(Rule-Based, No LLM)"]:::agent
        StubAgents["🧩 Stub Agents<br>(Support, Market Research)"]:::agent
    end

    %% Connections
    Client -->|User Query| FastAPI
    FastAPI -.->|Async Stream (SSE)| Client
    
    FastAPI -->|Load Context| Session
    FastAPI -->|Extract| SafetyGuard
    
    SafetyGuard --"Blocked (Harmful)"--> FastAPI
    SafetyGuard --"Passed"--> IntentClassifier
    
    IntentClassifier <-->|Prompt + Context| LLM
    IntentClassifier -->|Parsed Intent & Entities| Router
    
    Router -->|If 'portfolio_health'| PortHealth
    Router -->|If 'other'| StubAgents
    
    PortHealth -->|Read| UserData
    PortHealth -->|Read| MockData
    
    PortHealth -->|Structured Output<br>Observations + Disclaimers| FastAPI
    StubAgents -->|Not Implemented Response| FastAPI

    %% Data flow logic
    Session -.-> IntentClassifier
```

## 2. Figma Design Blueprint & Component Styling

When drawing this in Figma using your Clean Architecture and Component references, structure the canvas as follows:

### **A. Layout & Containers (Clean Architecture Style)**
Use nested rectangular frames with light background fills and dashed borders to represent boundaries.
1. **Outer Boundary:** "Valura AI Microservice"
2. **Horizontal Layers:**
   - **Top Layer (Presentation/API):** FastAPI Server and SSE Protocol.
   - **Middle Layer (Application Logic/Core):** Safety Guard, Intent Classifier, and Router.
   - **Bottom Layer (Domain/Agents & Data):** Portfolio Health, Stub Agents, Session Memory, and Data Models.

### **B. Components & Nodes**
Based on your UI references, use cards with icons for the following nodes:

*   **FastAPI Endpoint:** Icon: Server/Rocket. Color: Soft Blue. Role: Entry point, handles streaming.
*   **Safety Guard:** Icon: Shield. Color: Soft Orange/Red. Role: Zero-cost pure Python filter.
*   **Intent Classifier:** Icon: Brain/Processor. Color: Soft Purple. Role: The only component making an external network call.
*   **GPT-4o-mini (LLM):** Icon: Cloud/AI. Color: Dark Purple. Attach it via a bidirectional arrow to the Intent Classifier.
*   **Router:** Icon: Flowchart/Traffic Light. Color: Grey/Neutral.
*   **Portfolio Health Agent:** Icon: Stethoscope/Chart. Color: Soft Green. Role: Deterministic rule-based engine.
*   **Session State & Data:** Icon: Database/Folder. Color: Muted Teal. 

### **C. Connections & Flows**
Use the connection line styles from your Figma examples to show the flow of data:
1. **Solid Thick Lines (Primary Flow):** 
   - Client → FastAPI → Safety Guard → Classifier → Router → Portfolio Health.
2. **Dashed Lines with Animated/Arrowed Paths (Streaming):**
   - Portfolio Health → FastAPI → Client (Annotate as `Server-Sent Events (SSE)`).
3. **Red Dotted Lines (Failure/Blocked Paths):**
   - Safety Guard → FastAPI (Annotate as `Harmful Intent Blocked`).
4. **Thin Gray Lines (Data Access):**
   - Classifier ↔ Session Memory.
   - Portfolio Health ↔ User Data & Mock Market Data.

## 3. Key Architectural Highlights to Annotate in Figma
To make the diagram truly reflect the "Top 5% Lead Engineer Mindset" from your documentation, add small text callouts/sticky notes in Figma:
*   **Next to Safety Guard:** *"Pure Python, < 10ms Latency. Blocks before LLM."*
*   **Next to Intent Classifier:** *"Exactly 1 LLM Call. Strict JSON Schema. Guaranteed < 2s First-Token Latency."*
*   **Next to Portfolio Health:** *"100% Rule-Based. No LLM used here to save cost and guarantee CI determinism."*
*   **Next to FastAPI to Client:** *"Yields backpressure-handled SSE Streams. No stack traces exposed."*
