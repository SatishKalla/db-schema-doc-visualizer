# DB Copilot - Frontend

A modern React-based frontend application for visualizing, exploring, and documenting database schemas with AI-powered assistance. Built with TypeScript, Vite, and Ant Design, it provides an intuitive interface for database management, schema visualization, and interactive AI chat.

## Features

- **Database Connection Management**: Securely connect to MySQL and PostgreSQL databases
- **Schema Visualization**: Interactive database schema diagrams using Mermaid
- **AI-Powered Chat**: Ask questions about your database schemas with context-aware AI responses
- **Automated Insights**: Generate comprehensive schema documentation and best practice recommendations
- **User Authentication**: Secure login system with Supabase authentication
- **Access Control**: Request-based access management for databases
- **Data Visualization**: Charts and graphs for database metrics using Chart.js
- **Responsive Design**: Modern UI built with Ant Design components
- **Real-time Updates**: Live data synchronization and status updates

## Tech Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **UI Library**: Ant Design 5.x
- **Routing**: React Router DOM
- **Charts**: Chart.js with React Chart.js 2
- **Diagrams**: Mermaid
- **Markdown Rendering**: React Markdown
- **Development**: ESLint, TypeScript

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Backend API server running (see backend README)

## Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd db-schema-doc-visualizer/frontend
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

## Configuration

### Environment Variables

| Variable            | Description          | Required |
| ------------------- | -------------------- | -------- |
| `VITE_API_BASE_URL` | Backend API base URL | Yes      |

## Running the Application

### Development Mode

```bash
npm run dev
```

The application will start on `http://localhost:5173`

### Production Build

```bash
npm run build
npm run preview
```

### Linting

```bash
npm run lint
```

## Application Structure

### Pages

- **Login**: User authentication page
- **Connections**: Manage database connections
- **Databases**: View and manage connected databases
- **Insights**: AI-generated schema insights and documentation
- **Ask Database**: Interactive AI chat interface for database queries
- **Users**: User management (admin features)

### Key Components

- **ConnectionForm**: Database connection configuration
- **DatabaseList**: Database selection and management
- **Sidebar**: Navigation menu
- **TopNav**: Top navigation bar with user controls
- **RequestAccessModal**: Access request submission

### Context & Hooks

- **AuthContext**: User authentication state management
- **useAuth**: Authentication hook for login/logout

## API Integration

The frontend communicates with the backend API for:

- User authentication
- Database connections and management
- Schema extraction and visualization
- AI chat and insights generation
- Access request management

All API calls are handled through dedicated API modules in `src/api/`.

## UI/UX Features

- **Responsive Design**: Works on desktop and mobile devices
- **Dark/Light Theme**: Ant Design theme support
- **Loading States**: Skeleton loaders and progress indicators
- **Error Handling**: User-friendly error messages and retry options
- **Form Validation**: Real-time validation with helpful feedback
- **Accessibility**: ARIA labels and keyboard navigation support

## Development

### Project Structure

```
frontend/
├── src/
│   ├── api/                 # API integration modules
│   ├── assets/              # Static assets
│   ├── components/          # Reusable UI components
│   │   ├── connection-form/ # Connection form components
│   │   ├── database/        # Database-related components
│   │   ├── modals/          # Modal dialogs
│   │   ├── sidebar/         # Navigation sidebar
│   │   └── topbar/          # Top navigation
│   ├── context/             # React context providers
│   ├── hooks/               # Custom React hooks
│   ├── pages/               # Page components
│   │   ├── ask-database/    # AI chat page
│   │   ├── connections/     # Connection management
│   │   ├── databases/       # Database listing
│   │   ├── insights/        # Schema insights
│   │   ├── login/           # Authentication
│   │   └── users/           # User management
│   ├── routes/              # Routing configuration
│   ├── types/               # TypeScript type definitions
│   └── utils/               # Utility functions
├── public/                  # Public assets
├── index.html               # HTML template
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

### Adding New Features

1. Create page components in `src/pages/`
2. Add API integration in `src/api/`
3. Implement reusable components in `src/components/`
4. Update routing in `src/routes/`
5. Add TypeScript types in `src/types/`

### Code Style

- Use TypeScript for type safety
- Follow React functional component patterns
- Use custom hooks for shared logic
- Implement proper error boundaries
- Write descriptive component and function names

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Testing

Run the application in development mode and test all user flows:

- User registration and login
- Database connection setup
- Schema visualization
- AI chat functionality
- Access request workflow

## Deployment

1. Build the application:

   ```bash
   npm run build
   ```

2. Serve the `dist` folder with any static server
3. Configure environment variables for production
4. Set up reverse proxy for API calls if needed

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### Common Issues

- **API Connection Errors**: Verify backend server is running and API URL is correct
- **Authentication Issues**: Check Supabase configuration and keys
- **Build Errors**: Ensure all dependencies are installed and Node.js version is compatible

### Development Tips

- Use browser developer tools for debugging
- Check network tab for API request/response details
- Use React DevTools for component inspection
- Enable source maps in development for better debugging

## Support

For issues and questions, please open an issue in the repository or contact the development team.
