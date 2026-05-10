# 🏛️ Virtual Court Platform

<div align="center">
  <img src="https://img.shields.io/badge/Platform-Web-blue?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Platform" />
  <img src="https://img.shields.io/badge/Status-Enterprise_Ready-success?style=for-the-badge" alt="Status" />
  <img src="https://img.shields.io/badge/Security-AES--256-red?style=for-the-badge&logo=springsecurity" alt="Security" />
</div>

<br />

The **Virtual Court Platform** is an enterprise-grade, secure, and fully-featured digital courtroom solution designed to facilitate real-time judicial proceedings. Engineered with a strict failure-first design philosophy, the platform guarantees immutable audit logging, highly secure evidence handling, and seamless peer-to-peer (P2P) mesh communications to ensure justice is served without interruption.

---

## 🌟 Key Features

### 🔐 Zero-Trust Evidence Security
* **AES-256 Encryption**: All uploaded evidence is encrypted at rest within a secure, off-public-access Vault.
* **In-Memory Decryption**: Files are decrypted dynamically in-memory exclusively during authorized viewing sessions, leaving no unencrypted traces on the disk.
* **Dynamic Watermarking**: Documents are programmatically watermarked (via Jimp) during the viewing session to prevent unauthorized distribution.

### 🎥 High-Fidelity P2P Media Mesh
* **WebRTC Mesh Network**: Audio and video streaming is handled peer-to-peer, removing central points of failure and ensuring ultra-low latency for all participants.
* **Socket.io Orchestration**: A dedicated Signal Server handles all WebRTC signaling, waiting room logic, and dynamic state broadcasting.

### 🤖 Intelligence & Automation
* **AI Stenographer**: Integrated with the Grok LLM API to automatically process session transcripts and generate accurate, high-quality case summaries post-proceeding.
* **Immutable Audit Logs**: Every critical action (login, evidence upload, file access, session join) is recorded with millisecond-precision timestamps in the database, guaranteeing a cryptographically secure chain of custody.

### 🎭 Role-Based Access Control (RBAC)
* **⚖️ Hon. Judge**: Full admission control over the waiting room, mute/eject privileges, and overall session authority.
* **💼 Lawyer / Counsel**: Capabilities for secure evidence presentation and session scheduling.
* **🎙️ Witness / Defendant**: Restricted waiting room lobby access and controlled exhibit viewing.

---

## 🏛️ Advanced Legal Features

### 🚪 Virtual Waiting Room & Admission Control
The platform implements a formal "Waiting Room" protocol. When participants (Lawyers, Witnesses) join a session, they are placed in a secure lobby. The **Hon. Judge** or **Court Clerk** has a dedicated management panel to manually **Admit** participants into the live proceedings, ensuring full control over the courtroom environment.

### 🎭 Role-Adaptive UI Layout
The user interface is not a generic video grid. It dynamically rearranges participants based on their assigned judicial role to mirror a physical courtroom:
* **The Bench**: The Judge is positioned prominently at the top-center.
* **The Witness Stand**: The active witness is featured in a centralized focus area.
* **Counsel Tables**: Lawyers and advocates are positioned at dedicated tables for clear identification.

### 🔄 Real-Time Evidence Synchronization
When a Lawyer "Presents" evidence, the platform doesn't just share a screen. The specific exhibit is **synchronized across all authorized participants' screens instantly** via Socket.io. This ensures every participant is looking at the same high-resolution, watermarked document simultaneously.

### 📅 Automated Session Lifecycle
The system intelligently manages the courtroom session states:
* **Scheduled**: Session is awaiting start.
* **Ongoing**: Automatically triggered when the first participant is admitted.
* **Completed**: Triggered when the last participant leaves, automatically initiating the AI summarization process.

### 📜 Live Court Record (Transcript Source)
The persistent real-time chat is more than a communication tool—it serves as the **Official Court Record**. Every statement submitted is captured as part of the legal transcript, which provides the raw data for the **AI Stenographer** to generate its post-session summary.

---

## 🏗️ System Architecture

Our platform adheres to a strict microservice-inspired architecture, decoupling the media plane from standard REST operations. 

* **Frontend**: React.js SPA featuring a professional "Deep Slate & Gold" judicial theme.
* **Backend Gateway**: Express.js REST API with JWT-based gatekeeper authentication.
* **Persistence Layer**: MySQL with Sequelize ORM for transactional consistency.

![System Architecture](./architecture%20diagram.png)

*(A complete architectural diagram is available within the project documentation)*

---

## 📁 Project Structure

```text
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI Components
│   │   ├── layouts/        # Page Layouts (MainLayout)
│   │   ├── pages/          # View-level components
│   │   └── theme/          # Custom Slate & Gold design tokens
├── server/                 # Express Backend & Signal Server
│   ├── config/             # DB & Environment configuration
│   ├── controllers/        # Business logic for Auth, Meetings, Evidence
│   ├── middleware/         # Security Gatekeepers (JWT, Role validation)
│   ├── models/             # Sequelize Data Models
│   ├── routes/             # REST API Endpoint definitions
│   ├── services/           # Crypto & AI (Grok) integrations
│   └── websocket/          # Socket.io signaling handlers
├── README.md               # Project documentation
└── .gitignore              # Dependency & sensitive file exclusion
```

## 🛣️ API Reference

### Authentication
* `POST /api/auth/register` - Create user account
* `POST /api/auth/login` - Authenticate & receive JWT

### Courtroom Management
* `GET /api/meetings` - Fetch authorized sessions
* `POST /api/meetings` - Schedule new session (Judge only)
* `GET /api/meetings/:id` - Detailed session information

### Evidence Vault
* `POST /api/evidence/upload` - Encrypt & store document
* `GET /api/evidence/meeting/:id` - List exhibits for a session
* `GET /api/evidence/view/:id` - Secure, watermarked in-memory view

---

## 🔐 Core Security Workflows

### 🛡️ The "Gatekeeper" Pattern
Every request for sensitive data (Evidence, Session State) passes through a multi-layer middleware stack:
1. **JWT Verification**: Validates the user's identity.
2. **Meeting Guard**: Verifies the user is actually a participant in the requested session.
3. **Role Validation**: Ensures the action matches the user's privileges (e.g., only a Judge can eject a participant).

### 📄 Secure In-Memory Decryption
To ensure zero data leakage on the client or server disk:
1. The Encrypted file is read into a Node.js **Buffer**.
2. Decryption occurs entirely within RAM using the AES-256-CBC algorithm.
3. A dynamic watermark is applied to the image/PDF buffer via **Jimp**.
4. The final processed buffer is streamed directly to the frontend, never touching the local `public` folder.

---

## 💾 Database Entity Overview

The system uses a relational MySQL schema to maintain high data integrity:
* **Users**: Stores identity and persistent credentials.
* **Meetings**: The central entity connecting participants, timings, and statuses.
* **Evidence**: Tracks metadata and encryption hashes for all judicial exhibits.
* **AuditLogs**: A high-resolution tracking table that records every single system interaction with millisecond precision for forensic analysis.

---

## 🚀 Getting Started

### Prerequisites
* **Node.js** (v18+)
* **MySQL** Server
* **Grok API Key** (for AI Summarization)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/saurabh-G07/Virtual-court-platform.git
   cd Virtual-court-platform
   ```

2. **Install Server Dependencies:**
   ```bash
   cd server
   npm install
   ```

3. **Install Client Dependencies:**
   ```bash
   cd client
   npm install
   ```

### Environment Configuration

Create a `.env` file in the `server` directory and configure the following required secrets:

```env
PORT=5000
JWT_SECRET=your_super_secret_jwt_key
EVIDENCE_ENCRYPTION_KEY=32_byte_aes_256_key_here
GROK_API_KEY=your_grok_llm_key
DB_HOST=localhost
DB_USER=root
DB_PASS=password
DB_NAME=virtual_court
```

### Running the Platform

To start the local development environment, you will need two terminals.

**Terminal 1 (Backend & Signal Server):**
```bash
cd server
npm run dev
```

**Terminal 2 (React SPA):**
```bash
cd client
npm start
```

The application will be securely hosted at `http://localhost:3000`.

---

## ⚖️ User Journey Guide

Follow this sequence to experience the full courtroom workflow:

1. **The Judge's Setup**:
   - Register/Login and navigate to the **Dashboard**.
   - Click **"Create New Meeting"** and set the case title and schedule.
   - Copy the unique **Meeting ID** and share it with participants.
2. **Joining the Session**:
   - Participants (Lawyers, Witnesses) login and enter the **Meeting ID** to join the lobby.
   - The Judge receives a real-time notification via Socket.io and clicks **"Admit"** to let them into the courtroom.
3. **Presenting Evidence**:
   - A Lawyer clicks **"Upload Exhibit"** to securely encrypt a document into the Vault.
   - Once admitted, the Lawyer selects the exhibit to **Share with Court**.
   - All participants see the watermarked, decrypted version in real-time.
4. **AI Transcription**:
   - Once the Judge ends the session, the **AI Stenographer** automatically processes the transcript.
   - A downloadable **Case Summary** appears in the "Past Meetings" section after a few seconds.

---

## 🛠️ Troubleshooting

### MySQL Connection Issues
- **Error**: `ECONNREFUSED` or `Access denied for user`.
- **Solution**: Ensure your MySQL service is running and the credentials in your `server/.env` exactly match your local database configuration. Run `CREATE DATABASE virtual_court;` before starting the server.

### Socket.io / Media Failures
- **Error**: Video/Audio not connecting between participants.
- **Solution**: Since this uses a P2P Mesh network, ensure your firewall is not blocking UDP ports. If testing on the same machine, use two different browser profiles or Incognito mode to avoid session conflicts.

### AI Summary Not Generating
- **Error**: `401 Unauthorized` or empty summary.
- **Solution**: Verify your `GROK_API_KEY` is active and correctly pasted in the `.env` file. Check the server console for LLM rate-limiting logs.

---

## 🛡️ Security & Compliance
This system enforces strict access policies. Attempting to bypass the Express.js Gateway directly to the Vault will result in immediate rejection. All JWT tokens are actively monitored, and the system implements rapid token invalidation upon role-change or session termination.
