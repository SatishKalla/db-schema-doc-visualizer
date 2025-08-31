# DB Schema Doc Visualizer

Visualize, explore, and document your database schema—with an AI schema expert that answers questions, drafts docs, and guides best practices.

This project is divided into two main parts: **Frontend** and **Backend**.

## Have a look [Demo](https://db-schema-doc-visualizer.onrender.com/).

## Table of Contents

- [Project Structure](#project-structure)
- [Frontend](#frontend)
- [Backend](#backend)
- [Getting Started](#getting-started)

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

- **Tech Stack:** React + Vite
- **Location:** `/frontend`
- **Features:**
  - Interactive schema diagrams (Mermaid Js)
  - Documentation viewer (React Markdown)

### Setup

```bash
cd frontend
npm install
npm run start
```

---

## Backend

The backend handles schema extraction, API endpoints, and documentation generation.

- **Tech Stack:** Node.js + Express(Langchain.js with OpenRouter and knex.js)
- **Location:** `/backend`
- **Features:**
  - Connects to databases
  - Exposes RESTful APIs
  - Generates schema documentation

### Setup

```bash
cd backend
npm install
npm run start
```

---

## Getting Started

1. Clone the repository.
2. Install dependencies for both frontend and backend.
3. Start backend and frontend servers.
4. Access the frontend in your browser.
5. Access the backend api's in postman.

---
