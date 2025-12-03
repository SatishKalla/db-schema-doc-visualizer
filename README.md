# DB Copilot

A full-stack application for visualizing, exploring, and documenting database schemas with AI-powered assistance. Features interactive schema diagrams, AI chat for database queries, automated insights, secure authentication, and support for MySQL and PostgreSQL databases.

This project is divided into two main parts: **Frontend** and **Backend**.

## Have a look [Demo](https://db-schema-doc-visualizer.onrender.com/).

## Table of Contents

- [Project Structure](#project-structure)
- [Frontend](#frontend)
- [Backend](#backend)
- [Getting Started](#getting-started)

---

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MySQL or PostgreSQL database access
- Supabase account for authentication and data storage
- API keys for AI services (OpenRouter, Google AI, OpenAI)

---

## Project Structure

```
db-schema-doc-visualizer/
├── frontend/
├── backend/
└── README.md
```

---

## Frontend

The frontend is responsible for the user interface and visualization of database schemas.

- **Tech Stack:** React 19 with TypeScript, Vite, Ant Design 5.x, React Router DOM, Chart.js, Mermaid, React Markdown
- **Location:** `/frontend`
- **Features:**
  - Database Connection Management: Securely connect to MySQL and PostgreSQL databases
  - Schema Visualization: Interactive database schema diagrams using Mermaid
  - AI-Powered Chat: Ask questions about your database schemas with context-aware AI responses
  - Automated Insights: Generate comprehensive schema documentation and best practice recommendations
  - User Authentication: Secure login system with Supabase authentication
  - Access Control: Request-based access management for databases
  - Data Visualization: Charts and graphs for database metrics using Chart.js
  - Responsive Design: Modern UI built with Ant Design components
  - Real-time Updates: Live data synchronization and status updates

### Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Copy environment variables:

   ```bash
   cp .env.example .env
   ```

4. Configure your `.env` file:

   ```env
   VITE_API_BASE_URL=http://localhost:3000/api
   ```

5. Start the development server:

   ```bash
   npm run dev
   ```

   The application will start on `http://localhost:5173`

---

## Backend

The backend handles schema extraction, API endpoints, and documentation generation.

- **Tech Stack:** Node.js with TypeScript, Express.js, Supabase (PostgreSQL), Knex.js, LangChain.js with OpenRouter, Google GenAI, OpenAI, Winston, Helmet, CORS
- **Location:** `/backend`
- **Features:**
  - Database Connectivity: Connect to MySQL and PostgreSQL databases
  - Schema Visualization: Extract and analyze database schemas
  - AI-Powered Chat: Interactive Q&A about database schemas using LangChain and OpenRouter
  - Automated Insights: Generate schema documentation and best practice recommendations
  - User Authentication: Secure authentication via Supabase
  - Access Control: Request-based access management for databases
  - Real-time Logging: Winston-based logging with configurable levels
  - Security: Helmet for security headers, CORS configuration, data encryption
  - RAG System: Retrieval-Augmented Generation using vector embeddings for context-aware responses

### Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Copy environment variables:

   ```bash
   cp .env.example .env
   ```

4. Configure your `.env` file with required variables (see Configuration section below).

5. Start the development server:

   ```bash
   npm run dev
   ```

   The server will start on the configured port (default: 3000).

### Configuration

Create a `.env` file in the backend directory with the following variables:

```env
# Server Configuration
PORT=3000
FE_URL=http://localhost:5173

# AI Service API Keys
GOOGLE_API_KEY=your_google_api_key
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_BASE_URL=https://openrouter.ai

# AI Models
MODEL=gpt-4o-mini
EMB_MODEL=text-embedding-3-small

# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Security
ENCRYPTION_KEY=your_secure_encryption_key

# Optional
NODE_ENV=development
LOG_LEVEL=info
```

---

## Getting Started

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd db-schema-doc-visualizer
   ```

2. Set up the backend:

   - Follow the backend setup instructions above.

3. Set up the frontend:

   - Follow the frontend setup instructions above.

4. Access the application:

   - Frontend: Open `http://localhost:5173` in your browser.

   - Backend API: Available at `http://localhost:3000/api` (test with Postman).

---
