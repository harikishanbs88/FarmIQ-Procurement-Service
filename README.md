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

## 📄 License

This project is licensed under the [MIT License](LICENSE).
