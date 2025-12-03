# DB Copilot - Backend

A robust Node.js backend API for visualizing, exploring, and documenting database schemas with AI-powered assistance. Built with Express.js and LangChain, it provides RESTful endpoints for database connections, schema extraction, AI chat, and automated documentation generation.

## Features

- **Database Connectivity**: Connect to MySQL and PostgreSQL databases
- **Schema Visualization**: Extract and analyze database schemas
- **AI-Powered Chat**: Interactive Q&A about database schemas using LangChain and OpenRouter
- **Automated Insights**: Generate schema documentation and best practice recommendations
- **User Authentication**: Secure authentication via Supabase
- **Access Control**: Request-based access management for databases
- **Real-time Logging**: Winston-based logging with configurable levels
- **Security**: Helmet for security headers, CORS configuration, data encryption
- **RAG System**: Retrieval-Augmented Generation using vector embeddings for context-aware responses

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Databases     │
│   (React)       │◄──►│   (Express)     │◄──►│   (MySQL/PG)    │
│                 │    │                 │    │                 │
│ • UI Components │    │ • Controllers   │    │ • Schema Data   │
│ • Charts        │    │ • Services      │    │ • User Data     │
│ • Chat Interface│    │ • Middleware    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Supabase      │    │   AI Models     │    │   Vector Store  │
│   (Auth/Data)   │    │   (OpenRouter)  │    │   (pgvector)     │
│                 │    │                 │    │                 │
│ • User Auth     │    │ • GPT Models    │    │ • Embeddings    │
│ • Chat History  │    │ • Embeddings    │    │ • Schema Chunks │
│ • Access Control│    │                 │    │ • Q&A Pairs     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Data Flow

1. **User Query** → Frontend → Backend API
2. **Classification** → Determine if database-related using AI + keyword matching
3. **Retrieval** → Fetch relevant schema context from vector store
4. **Generation** → AI generates response with retrieved context
5. **Execution** → Run safe SQL queries if needed
6. **Response** → Return formatted answer to user

## RAG (Retrieval-Augmented Generation) System

The backend implements a sophisticated RAG system to provide context-aware AI responses about database schemas:

### Embedding Storage

- **Vector Database**: Uses Supabase with pgvector extension
- **Table Structure**: Separate vector tables per database (`vectors_{databaseId}`)
- **Embedding Model**: Google Generative AI embeddings (configurable, default: text-embedding-3-small)
- **Chunking**: Recursive text splitter (1000 chars with 100 char overlap)
- **Content Types**:
  - Schema documentation and ER diagrams
  - Previous Q&A pairs for continuous learning
  - Database structure metadata

### Retrieval Process

- **Similarity Search**: Cosine similarity matching on embeddings
- **Top-K Retrieval**: Returns 3 most relevant document chunks
- **Filtering**: Database-specific retrieval with metadata filtering
- **Fallback**: Keyword-based matching when AI confidence is low

### Generation Pipeline

- **LangGraph Workflow**: Multi-step agent flow (classify → retrieve → generate → execute)
- **Context Integration**: Retrieved documents injected into AI prompts
- **SQL Safety**: Only executes SELECT queries for security
- **Continuous Learning**: Q&A pairs added back to vector store for future retrieval

### Benefits

- **Context Awareness**: AI understands specific database schemas
- **Accuracy**: Grounded responses based on actual schema data
- **Learning**: System improves with each interaction
- **Security**: Isolated vector stores per database/user

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Query Builder**: Knex.js
- **AI/ML**: LangChain.js with OpenRouter, Google GenAI, OpenAI
- **Authentication**: Supabase Auth
- **Logging**: Winston
- **Security**: Helmet, CORS
- **Development**: tsx, ts-node-dev

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MySQL or PostgreSQL database access
- Supabase account for authentication and data storage
- API keys for AI services (OpenRouter, Google AI, OpenAI)

## Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd db-schema-doc-visualizer/backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Copy environment variables:

   ```bash
   cp .env.example .env
   ```

4. Configure your `.env` file with required variables (see Configuration section).

## Configuration

Create a `.env` file in the root directory with the following variables:

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

### Environment Variables Description

| Variable             | Description                       | Required                                |
| -------------------- | --------------------------------- | --------------------------------------- |
| `PORT`               | Server port                       | No (defaults to 3000)                   |
| `FE_URL`             | Frontend URL for CORS             | No (defaults to localhost:5173)         |
| `GOOGLE_API_KEY`     | Google AI API key                 | Yes (for AI features)                   |
| `OPENROUTER_API_KEY` | OpenRouter API key                | Yes (for AI models)                     |
| `SUPABASE_URL`       | Supabase project URL              | Yes                                     |
| `SUPABASE_ANON_KEY`  | Supabase anonymous key            | Yes                                     |
| `ENCRYPTION_KEY`     | Key for encrypting sensitive data | Yes                                     |
| `MODEL`              | Primary AI model                  | No (defaults to gpt-4o-mini)            |
| `EMB_MODEL`          | Embedding model                   | No (defaults to text-embedding-3-small) |

## Running the Application

### Development Mode

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

The server will start on the configured port (default: 3000).

## API Endpoints

All endpoints are prefixed with `/api` and require authentication where noted.

### Authentication

| Method | Endpoint       | Description | Auth Required |
| ------ | -------------- | ----------- | ------------- |
| POST   | `/auth/login`  | User login  | No            |
| POST   | `/auth/logout` | User logout | Yes           |

### Database Management

| Method | Endpoint                                  | Description                   | Auth Required |
| ------ | ----------------------------------------- | ----------------------------- | ------------- |
| POST   | `/db/connect`                             | Connect to a database         | Yes           |
| POST   | `/db/connections`                         | Create database connection    | Yes           |
| PUT    | `/db/connections/:connectionId`           | Update connection             | Yes           |
| GET    | `/db/connections`                         | List user connections         | Yes           |
| DELETE | `/db/connections/:connectionId`           | Delete connection             | Yes           |
| POST   | `/db/databases`                           | List databases for connection | Yes           |
| POST   | `/db/databases/create`                    | Create new database           | Yes           |
| GET    | `/db/databases/selected`                  | List selected databases       | Yes           |
| DELETE | `/db/databases/:databaseId`               | Delete database               | Yes           |
| GET    | `/db/connections/:connectionId/databases` | List databases for connection | Yes           |

### Chat Management

| Method | Endpoint                     | Description             | Auth Required |
| ------ | ---------------------------- | ----------------------- | ------------- |
| POST   | `/chat`                      | Save chat with messages | Yes           |
| GET    | `/chat`                      | Get all user chats      | Yes           |
| GET    | `/chat/:id`                  | Get specific chat       | Yes           |
| DELETE | `/chat/:id`                  | Delete chat             | Yes           |
| GET    | `/chat/database/:databaseId` | Get chats for database  | Yes           |

### AI Agent

| Method | Endpoint                      | Description                 | Auth Required |
| ------ | ----------------------------- | --------------------------- | ------------- |
| GET    | `/agent/check`                | Check AI service connection | No            |
| POST   | `/agent/insights`             | Generate schema insights    | Yes           |
| GET    | `/agent/insights/:databaseId` | View insights for database  | Yes           |
| POST   | `/agent/ask`                  | Ask AI agent questions      | Yes           |

### Access Requests

| Method | Endpoint       | Description           | Auth Required |
| ------ | -------------- | --------------------- | ------------- |
| POST   | `/request`     | Submit access request | Yes           |
| GET    | `/request`     | List access requests  | Yes           |
| PUT    | `/request/:id` | Update request status | Yes           |

## Project Structure

```
backend/
├── src/
│   ├── app.ts                 # Express app configuration
│   ├── server.ts              # Server entry point
│   ├── config.ts              # Environment configuration
│   ├── clients/
│   │   └── supabase-client.ts # Supabase client setup
│   ├── controllers/           # Route handlers
│   │   ├── auth.controller.ts
│   │   ├── db.controller.ts
│   │   ├── chat.controller.ts
│   │   ├── agent.controller.ts
│   │   └── request-access.controller.ts
│   ├── middlewares/           # Express middlewares
│   │   ├── auth.ts
│   │   ├── error-handler.ts
│   │   ├── not-found.ts
│   │   └── request-logger.ts
│   ├── routes/                # Route definitions
│   ├── services/              # Business logic
│   ├── utils/                 # Utility functions
│   │   ├── agent-graph.ts
│   │   ├── ai-models.ts
│   │   ├── db-connection.ts
│   │   ├── encryption.ts
│   │   ├── logger.ts
│   │   ├── prompts.ts
│   │   └── retriever.ts
│   └── types/                 # TypeScript types
├── .env.example               # Environment template
├── package.json
├── tsconfig.json
└── README.md
```

## Development

### Adding New Features

1. Create controllers in `src/controllers/`
2. Implement business logic in `src/services/`
3. Define routes in `src/routes/`
4. Add validation and error handling
5. Update this README with new endpoints

### Testing

Run the application in development mode and test endpoints using tools like Postman or curl.

### Logging

Logs are written to console with Winston. Configure log level via `LOG_LEVEL` environment variable.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For issues and questions, please open an issue in the repository.
