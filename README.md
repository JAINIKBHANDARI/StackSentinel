# StackSentinel — Application Stack Monitoring & CI/CD Platform

> **Advanced Software Engineering (ASE) Capstone Project & Technical Portfolio**  
> *A high-reliability observability, health-probe, and deployment tracking platform built with the MERN stack.*

---

## 📌 Project Overview

**StackSentinel** is a developer and DevOps observability platform designed to centralize application health monitoring, latency degradation tracking, and CI/CD release auditing into one dashboard.

In distributed microservice architectures, silent API degradations and network failures frequently go unnoticed until end users report outages. StackSentinel actively sends HTTP probes to registered service endpoints, measures roundtrip latency, verifies status codes, calculates availability SLAs from persistent time-series data, and maintains build records prepared for automated CI/CD pipeline webhooks.

---

## 🚀 Key Features

- **⚡ Real-Time Service Probing**: Safe, asynchronous HTTP health checks measure latency (ms) and HTTP response codes against user-configured expectations.
- **📊 Calculated Availability & SLA**: Computes true mathematical availability percentages from persistent historical probe records (`Availability = Successful Probes / Total Probes × 100`).
- **⚠️ Automated Degradation Detection**: Automatically flags endpoints exceeding response latency thresholds (e.g., >800ms) as `DEGRADED`, alerting teams before complete failure.
- **🔐 JWT Authentication & RBAC**: Secure JSON Web Token authentication with bcrypt password hashing and Role-Based Access Control (`USER` vs `ADMIN`).
- **🛡️ Multi-Environment Workloads**: Segment endpoints and telemetry across `Development`, `Staging`, and `Production`.
- **🚀 CI/CD Release Tracking**: Captures versions, branches, commit hashes, build durations, and statuses (`QUEUED`, `RUNNING`, `SUCCESS`, `FAILED`, `CANCELLED`).
- **👑 System Governance & Admin Hub**: System-wide telemetry, user management, and audit feeds protected by administrative middleware.
- **🎨 DevOps Dark/Light Technical Interface**: Modern interface styled with custom CSS variables, status badges, and availability timeline bars.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, React Router v6, Axios, Lucide Icons, Vanilla CSS Design System |
| **Backend** | Node.js, Express.js, Helmet, CORS, Morgan |
| **Database** | MongoDB, Mongoose ODM |
| **Authentication** | JSON Web Tokens (JWT), bcryptjs |
| **Testing** | Jest, Supertest |
| **DevOps Readiness** | Git, Environment Configurations, Jenkins Pipeline-Ready Data Models |

---

## 🏗️ Architecture & Flow

```
[ Developer / Browser ]
           │
     (HTTP / HTTPS)
           ▼
[ React + Vite Client (Port 5173) ]
           │
   (Axios with JWT Bearer)
           ▼
[ Express API Server (Port 5000) ]
   ├── Helmet & CORS Security
   ├── Auth Middleware (JWT Verification)
   ├── Role Middleware (ADMIN Guard)
   ├── Health Check Probing Service (Axios Probes with Safe Timeout)
   └── Centralized Error Handling
           │
     (Mongoose ODM)
           ▼
[ MongoDB Database (Port 27017) ]
   ├── Users Collection (Hashed passwords, roles)
   ├── Services Collection (Target URLs, status snapshots)
   ├── HealthChecks Collection (Time-series probe results)
   └── Deployments Collection (Pipeline execution records)
```

---

## 📂 Project Folder Structure

```
ASE PROJECT/
├── .gitignore                      # Root Git ignore (node_modules, .env, dist, logs)
├── README.md                       # Comprehensive project documentation
│
├── server/                         # Backend Express API & Engine
│   ├── config/
│   │   └── db.js                   # Mongoose connection configuration
│   ├── controllers/
│   │   ├── authController.js       # Register, login, me endpoints
│   │   ├── serviceController.js    # Service CRUD, on-demand probe, health history
│   │   ├── healthController.js     # Platform heartbeat & engine status
│   │   ├── deploymentController.js # CI/CD deployment tracking & simulation
│   │   └── adminController.js      # Cross-cluster metrics & user governance
│   ├── middleware/
│   │   ├── authMiddleware.js       # JWT bearer token verification
│   │   ├── adminMiddleware.js      # Role-based restriction (ADMIN only)
│   │   └── errorMiddleware.js      # Centralized error handler & 404 router
│   ├── models/
│   │   ├── User.js                 # User schema with pre-save password hash
│   │   ├── Service.js              # Monitored service schema with status snapshot
│   │   ├── HealthCheck.js          # Persistent probe history & latency model
│   │   └── Deployment.js           # Build execution & pipeline history model
│   ├── routes/
│   │   ├── authRoutes.js           # /api/auth routes
│   │   ├── serviceRoutes.js        # /api/services routes
│   │   ├── healthRoutes.js         # /api/health routes
│   │   ├── deploymentRoutes.js     # /api/deployments routes
│   │   └── adminRoutes.js          # /api/admin routes
│   ├── services/
│   │   ├── healthCheckService.js   # HTTP probe execution & SSRF safety rules
│   │   └── availabilityService.js  # Calculated availability % and latency stats
│   ├── utils/
│   │   └── response.js             # Standardized success/error JSON utilities
│   ├── scripts/
│   │   └── seed.js                 # Database seed script with demo users/services
│   ├── tests/
│   │   └── api.test.js             # Jest + Supertest integration test suite
│   ├── app.js                      # Express application composition
│   ├── server.js                   # Server entry point & listener
│   ├── package.json
│   ├── .env.example
│   └── .env
│
└── client/                         # Frontend React + Vite Dashboard
    ├── public/
    ├── src/
    │   ├── api/
    │   │   └── axios.js            # Axios client with JWT interceptor
    │   ├── context/
    │   │   ├── AuthContext.jsx     # Authentication state & session recovery
    │   │   └── ToastContext.jsx    # Toast notification queue
    │   ├── components/
    │   │   ├── common/
    │   │   │   ├── Navbar.jsx      # Top header with profile & session controls
    │   │   │   ├── Sidebar.jsx     # Navigation panel with live engine heartbeat
    │   │   │   ├── Footer.jsx      # Footer with project and architecture credits
    │   │   │   ├── Button.jsx      # Multi-variant button with loading states
    │   │   │   ├── Input.jsx       # Standard form input component
    │   │   │   ├── Select.jsx      # Dropdown selector
    │   │   │   ├── Modal.jsx       # Accessible modal container
    │   │   │   ├── ConfirmationModal.jsx # Deletion confirmation dialog
    │   │   │   ├── LoadingSpinner.jsx
    │   │   │   ├── EmptyState.jsx
    │   │   │   ├── ErrorState.jsx
    │   │   │   ├── StatusBadge.jsx # UP / DEGRADED / DOWN / UNKNOWN badges
    │   │   │   └── HealthIndicator.jsx # Live pulsing status indicator dot
    │   │   ├── dashboard/
    │   │   │   ├── MetricCard.jsx  # Telemetry KPI metric cards
    │   │   │   ├── ServiceCard.jsx # Service card with quick-probe actions
    │   │   │   ├── DeploymentCard.jsx # Pipeline execution card
    │   │   │   ├── ActivityFeed.jsx   # Live system events feed
    │   │   │   └── AvailabilityBar.jsx# Visual timeline of recent probe statuses
    │   │   └── routing/
    │   │       ├── ProtectedRoute.jsx # Guard for authenticated users
    │   │       └── AdminRoute.jsx     # Guard for administrative users
    │   ├── pages/
    │   │   ├── LandingPage.jsx     # Marketing landing page with hero & CTAs
    │   │   ├── LoginPage.jsx       # Login form with 1-click demo accounts
    │   │   ├── RegisterPage.jsx    # Account registration with role selection
    │   │   ├── DashboardPage.jsx   # Top metrics, health cards, activity feed
    │   │   ├── ServicesPage.jsx    # Service CRUD, search, and environment filter
    │   │   ├── ServiceDetailsPage.jsx # SLA calculation, latency stats, history
    │   │   ├── DeploymentsPage.jsx # CI/CD deployment history & simulation
    │   │   ├── AdminPage.jsx       # Global system metrics & user management
    │   │   ├── ProfilePage.jsx     # User details & JWT token preview
    │   │   ├── SettingsPage.jsx    # Telemetry polling rules & webhook config
    │   │   └── NotFoundPage.jsx    # 404 page
    │   ├── App.jsx                 # Routing configuration
    │   ├── index.css               # Modern DevOps technical design system
    │   └── main.jsx
    ├── index.html
    ├── vite.config.js
    ├── package.json
    ├── .env.example
    └── .env
```

---

## ⚙️ Environment Variables

### Backend (`server/.env`)
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/stacksentinel
JWT_SECRET=stacksentinel_jwt_secret_dev_key_2026
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### Frontend (`client/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🏃 Local Setup & Execution Guide

### Prerequisites
- **Node.js**: v18.x or v20.x+ (tested on Node v22.x)
- **npm**: v9.x or v10.x+
- **MongoDB**: Local MongoDB community service running on port 27017, or a MongoDB Atlas URI

---

### Step 1: Install Dependencies

Open two terminal windows or run sequentially:

```bash
# 1. Install Backend Dependencies
cd server
npm install

# 2. Install Frontend Dependencies
cd ../client
npm install
```

---

### Step 2: Seed the Database with Demo Data

Populate demo users, 6 sample stack services, historical health checks, and sample CI/CD deployments:

```bash
cd server
npm run seed
```

#### Demo Credentials Created:
| Role | Email | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin@stacksentinel.io` | `Admin@Password123` |
| **Standard User** | `dev@stacksentinel.io` | `Dev@Password123` |

*(Note: The login page includes quick-fill buttons to populate these credentials in one click).*

---

### Step 3: Run the Development Servers

```bash
# Terminal 1: Backend Server (Port 5000)
cd server
npm run dev

# Terminal 2: Frontend Client (Port 5173)
cd client
npm run dev
```

Visit **http://localhost:5173** in your browser.

---

### Step 4: Run Automated Tests

To run the Jest and Supertest backend integration test suite:

```bash
cd server
npm test
```

All 13 test suites covering authentication, duplicate detection, unauthenticated rejections, service registration, manual health checks, and role-based admin guards will execute and pass.

---

### Step 5: Validate Production Bundle Build

To verify that the frontend builds without errors:

```bash
cd client
npm run build
```

---

## 🌐 API Reference

### Auth Endpoints
- `POST /api/auth/register` — Register a new account (`name`, `email`, `password`, `role`).
- `POST /api/auth/login` — Authenticate and receive a JWT bearer token.
- `GET /api/auth/me` — Retrieve profile data of authenticated user.

### Services Endpoints
- `GET /api/services` — List monitored services (regular users see own; admins see all).
- `GET /api/services/:id` — Get single service with computed availability SLA and latency metrics.
- `POST /api/services` — Register a new microservice / endpoint.
- `PUT /api/services/:id` — Update service configuration.
- `DELETE /api/services/:id` — Delete a service and its associated health check logs.
- `POST /api/services/:id/check` — Trigger an immediate active HTTP health check probe.
- `GET /api/services/:id/health-history` — Paginated history of past health checks.

### Health Endpoints
- `GET /api/health` — Platform heartbeat status (engine status, DB connectivity, memory footprint).

### Deployments Endpoints
- `GET /api/deployments` — List deployment records with environment and status filters.
- `GET /api/deployments/:id` — Retrieve details for a single deployment event.
- `POST /api/deployments` — Record or simulate a CI/CD build deployment.
- `PUT /api/deployments/:id/status` — Update deployment execution status.

### Admin Endpoints (Requires ADMIN Role)
- `GET /api/admin/stats` — System-wide metrics (total users, services, probes, global SLA).
- `GET /api/admin/users` — List all registered users and their workload counts.
- `PUT /api/admin/users/:id/role` — Promote or demote user roles (`USER` <-> `ADMIN`).
- `GET /api/admin/activity` — Cross-system audit telemetry and probe event stream.

---

## 📊 Database Models

1. **User**:
   - `name`, `email` (unique index), `password` (bcrypt hashed), `role` (`USER` / `ADMIN`), timestamps.
2. **Service**:
   - `name`, `description`, `url`, `environment` (`Development` / `Staging` / `Production`), `category` (`Frontend` / `Backend` / `API` / `Database` / `Third-party`), `expectedStatusCode`, `active`, `user` (ref: User), `status` (`UP` / `DOWN` / `DEGRADED` / `UNKNOWN`), `lastHttpStatus`, `lastResponseTime`, `lastChecked`, `lastSuccessfulCheck`, timestamps.
3. **HealthCheck**:
   - `service` (ref: Service, indexed), `status`, `httpStatus`, `responseTime` (ms), `error`, `checkedAt` (indexed).
4. **Deployment**:
   - `service` (ref: Service, indexed), `version`, `branch`, `commitHash`, `environment`, `status` (`QUEUED` / `RUNNING` / `SUCCESS` / `FAILED` / `CANCELLED`), `triggeredBy`, `startedAt`, `completedAt`, `duration`, `message`, timestamps.

---

## 🎓 Advanced Software Engineering (ASE) Concepts Demonstrated

1. **Client-Server Architecture**: Strict separation of concerns between a React Single Page Application (SPA) client and a stateless Express REST API.
2. **RESTful Design**: Predictable resource URLs, proper HTTP verbs (`GET`, `POST`, `PUT`, `DELETE`), consistent JSON responses, and semantic HTTP status codes (`200`, `201`, `400`, `401`, `403`, `404`, `500`).
3. **Modular Architecture**: Layered separation across `routes/`, `controllers/`, `middleware/`, `models/`, `services/`, and `utils/` ensuring testability and separation of logic.
4. **Authentication & Authorization**: Stateless JWT verification with automatic expiration handling paired with Role-Based Access Control (RBAC) enforced both at middleware and UI levels.
5. **Data Modeling & Referential Integrity**: Normalized MongoDB schemas with Mongoose references, composite indexes, and cascading deletions.
6. **Robust Error Handling**: Centralized error middleware handling Mongoose `CastError`, duplicate keys (`E11000`), validation errors, and token expirations.
7. **Defensive Network Probing (SSRF Prevention)**: Protocol allow-listing (enforcing HTTP/HTTPS) and timeout limits on outbound probes.
8. **Mathematical SLA Computation**: Dynamic calculation of availability and response time percentiles from persistent telemetry logs rather than static mock percentages.
9. **CI/CD Readiness**: Structured deployment models and automated build simulations preparing the platform for enterprise pipeline integration.

---

## 🚀 Jenkins CI/CD Pipeline Integration (Active)

StackSentinel includes complete Jenkins automation via a declarative **`Jenkinsfile`** at the repository root and an active webhook endpoint:

```
GitHub Push / PR
       │
       ▼
[ Jenkins Pipeline ]
  ├── Stage 1: Git Checkout (Retrieves latest branch code)
  ├── Stage 2: Install Dependencies (npm ci parallelized for server & client)
  ├── Stage 3: Automated Integration Tests (npm test - Jest & Supertest, 17 suites)
  ├── Stage 4: Production Artifact Build (npm run build in client)
  └── Stage 5: Live Telemetry Dispatch (curl POST /api/deployments/jenkins)
       │
       ▼
[ StackSentinel Console ]
  └── Live deployment card updated in real time: Status, Duration, Commit Hash, Version
```

### Webhook Configuration
- **Endpoint**: `POST /api/deployments/jenkins`
- **Security Header**: `x-jenkins-token: stacksentinel_jenkins_secret_2026`
- **Payload**:
```json
{
  "buildNumber": "42",
  "version": "v1.42.0",
  "branch": "main",
  "commitHash": "a1b2c3d",
  "status": "SUCCESS",
  "environment": "Production",
  "duration": 35,
  "message": "Automated build #42 verified via Jenkins Pipeline"
}
```

---

## 🍃 MongoDB Cloud Atlas Setup (For Vercel & Production)

To enable persistent database login in cloud deployments (e.g. Vercel, Render):

1. **Create Free MongoDB Atlas Cluster**:
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free Shared cluster (M0).
   - In **Database Access**, create a database user (e.g., `stacksentinel_admin`).
   - In **Network Access**, add IP `0.0.0.0/0` (Allow Access from Anywhere) to permit cloud platform connections.
2. **Retrieve Connection URI**:
   - Click **Connect** -> **Drivers (Node.js)**.
   - Copy connection string:
     ```
     mongodb+srv://<username>:<password>@cluster0.mongodb.net/stacksentinel?retryWrites=true&w=majority
     ```
3. **Configure Environment Variables**:
   - In Vercel (`Settings` -> `Environment Variables`) or server `.env`:
     - `MONGO_URI`: Your MongoDB Atlas URI
     - `JWT_SECRET`: A secure random string (e.g., `stacksentinel_jwt_secret_prod_key_2026`)
     - `JENKINS_WEBHOOK_SECRET`: `stacksentinel_jenkins_secret_2026`
4. **Seed Atlas Database (One-time)**:
   ```bash
   MONGO_URI="mongodb+srv://<user>:<password>@cluster0.mongodb.net/stacksentinel" npm run seed
   ```

---

## 🚢 Deployment Architecture (Vercel & Cloud)

- **Frontend**: Live on Vercel at `https://stack-sentinel-blush.vercel.app/` with Single Page Application rewrites configured via `client/vercel.json`.
- **Backend API**: Configured with `api/index.js` serverless handler and Mongoose connection caching, ready to run directly on Vercel serverless or as a standalone container on Render/Railway.
- **Offline & Demo Mode**: The login screen includes 1-click **Instant Cloud Demo** buttons, ensuring professors and reviewers can test all telemetry dashboards immediately even before setting up a remote database.


---

## 🎤 Interview & Presentation Talking Points

1. **"How does StackSentinel distinguish between DEGRADED and DOWN states?"**
   > *Response:* A service is marked `UP` when the response code matches the expected code (e.g. 200 OK) and latency is within acceptable limits (<= 800ms). If it responds with the expected code but latency exceeds 800ms, it transitions to `DEGRADED`. If the host is unreachable, times out after 6000ms, or returns unexpected 5xx/4xx codes, it is marked `DOWN`.

2. **"How is availability computed?"**
   > *Response:* Availability is not hardcoded. The `availabilityService` queries stored `HealthCheck` records for each service and computes `(successfulChecks / totalChecks) * 100`, providing an honest representation of uptime history.

3. **"How are administrative endpoints secured?"**
   > *Response:* All administrative routes are protected by a two-stage middleware pipeline: first `authMiddleware.protect` validates the JWT signature and extracts user identity; then `adminMiddleware.requireAdmin` verifies that `req.user.role === 'ADMIN'`, rejecting unauthorized access with `403 Forbidden`.
