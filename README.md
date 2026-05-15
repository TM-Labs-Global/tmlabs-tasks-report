# TM Labs — Product Operations Dashboard

An executive-level reporting dashboard for TM Labs, powered by real-time ClickUp data.

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+
- A ClickUp Personal API Token (starts with `pk_...`)

### 2. Setup
```bash
# Clone the repository
# (Assuming you are in the project folder)

# Install dependencies
npm install

# Run the development server
npm run dev
```

### 3. Connect ClickUp
1. Open [http://localhost:3000](http://localhost:3000)
2. You will be prompted to enter your **ClickUp Personal API Token**.
3. To find your token:
   - Go to [ClickUp Settings](https://app.clickup.com/settings/apps)
   - Click on **Apps** in the sidebar.
   - Copy your **API Token**.

## 📊 Features

- **Executive Overview**: 8 KPI cards, weekly trends, and project progress.
- **Reporting Center**: Detailed Weekly, Monthly, and Historical reports with CSV export.
- **Team Performance**: Individual workload tracking and comparison charts.
- **Project Health**: Real-time status indicators for all workspace lists.
- **Global Filters**: Filter the entire dashboard by Status, Priority, Project, or Assignee.
- **Task Detail**: Deep-dive into any task without leaving the dashboard.

## 🛠 Tech Stack

- **Framework**: Next.js 14/15 (App Router)
- **Styling**: Tailwind CSS v4 (CSS-first token system)
- **Charts**: Recharts
- **Icons**: Lucide React
- **API**: ClickUp REST API v2

## 📁 Application Structure

- `app/`: Next.js routes and pages.
- `shared/context/`: Global state (ClickUp, Filters).
- `shared/hooks/`: Data fetching and filtering logic.
- `shared/components/`: Modular UI library (Charts, Tables, Cards).
- `shared/styles/`: Design System tokens (Colors, Typography).

## 🔒 Security
- Your API token is stored only in your browser's local storage.
- All API calls are made directly from your browser to ClickUp's servers.
- No task data is stored on any server outside of ClickUp.

---
© 2026 TM Labs. Proprietary and Confidential.
