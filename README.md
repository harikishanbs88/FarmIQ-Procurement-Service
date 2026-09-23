# FarmIQ - Agricultural Procurement Service

A modern agricultural procurement and slot booking platform empowering farmers to easily book delivery slots, find nearby APMC procurement centers, track queue times, and manage tokens.

---

## 🌾 Features

- **Procurement Center Discovery**: Search nearby APMC yards and Raita Seva Kendras with distance, accepted crops, and operational status.
- **Smart Slot Booking**: Reserve time slots for crop delivery (Tomato, Onion, Ragi, Maize, Rice, etc.) and generate verified digital tokens.
- **Live Queue & Wait Times**: Track farmer queue lengths and estimated waiting times in real time.
- **Timely Alerts & Notifications**: Departure reminders, slot confirmation, and weather/market updates.
- **Multilingual Support**: Available in English, Kannada (ಕನ್ನಡ), and Hindi (हिंदी).

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Radix UI, Lucide Icons, Wouter routing
- **State & Data Fetching**: TanStack React Query
- **Backend API**: Node.js, Express 5, TypeScript
- **Database & ORM**: PostgreSQL, Drizzle ORM, Drizzle-Zod
- **API Spec & Codegen**: OpenAPI 3.1 with Orval codegen
- **Package Manager**: pnpm workspaces

---

## 📁 Repository Structure

```
├── artifacts/
│   ├── farmiq/             # Main FarmIQ React web application
│   ├── api-server/         # Express backend API server
│   └── mockup-sandbox/     # Component preview and mockup sandbox
├── lib/
│   ├── api-spec/           # OpenAPI 3.1 specification & Orval configuration
│   ├── api-zod/            # Generated Zod validation schemas
│   ├── api-client-react/   # Generated React Query API hooks
│   └── db/                 # Drizzle ORM schemas and database configuration
├── package.json            # Workspace root configuration
└── pnpm-workspace.yaml     # pnpm workspace definition
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20 or higher)
- [pnpm](https://pnpm.io/) (`npm install -g pnpm`)

### Installation

```bash
# Clone the repository
git clone https://github.com/<YOUR-USERNAME>/FarmIQ-Procurement-Service.git
cd FarmIQ-Procurement-Service

# Install dependencies
pnpm install
```

### Running Locally

```bash
# Run the frontend application (FarmIQ)
pnpm --filter farmiq run dev

# Run the API server (port 5000)
pnpm --filter @workspace/api-server run dev

# Run full typecheck across all workspace packages
pnpm run typecheck

# Build all packages
pnpm run build
```

---

## ☁️ Vercel Deployment & Live URLs

The project is deployed and live on **Vercel Production**:

- 🌐 **Live Web Application**: [https://farmiq-procurement-service.vercel.app](https://farmiq-procurement-service.vercel.app)
- 🔌 **Live Centres API**: [https://farmiq-procurement-service.vercel.app/api/centres](https://farmiq-procurement-service.vercel.app/api/centres)
- 🌾 **Live Govt Prices API**: [https://farmiq-procurement-service.vercel.app/api/govt/prices](https://farmiq-procurement-service.vercel.app/api/govt/prices)

### Architecture
- **Frontend**: Vite React 18 SPA built and synchronized to root `public`.
- **Backend API**: Serverless Express function located at `api/index.js`.
- **Routing & Rewrites**: Defined in [`vercel.json`](./vercel.json):
  - `/api/(.*)` &rarr; `/api/index` (Serverless Function)
  - `/(.*)` &rarr; `/index.html` (Single Page Application fallback)

---

## 🏛️ Government Portal Grounding & AI Sync Engine

- **Official Data Sources**:
  - [Agmarknet (Ministry of Agriculture & Farmers Welfare)](https://agmarknet.gov.in)
  - [Karnataka Krishi Marata Vahini (APMC e-Portal)](https://krishimaratavahini.kar.nic.in)
  - [Open Government Data Platform India (data.gov.in)](https://data.gov.in)
- **Real-Time AI Sync**:
  - SSE (Server-Sent Events) live streaming endpoint at `/api/govt/stream`.
  - Automatic change-detection & verification engine.
  - Sub-second UI updates across MSP prices, APMC yard capacity, wait times, and weather alerts.
  - Interactive "Simulate Govt Update" feature on the live banner for instant demonstration.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

