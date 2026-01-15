# Overview

Gen Z International is a social media marketplace application that allows users to earn money by submitting their social media accounts for various services. The platform features a full-stack TypeScript architecture with React frontend, Express backend, and PostgreSQL database integration. Users can submit social media accounts, participate in quizzes, manage referrals, and track earnings through a comprehensive dashboard system.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The frontend is built as a React SPA using TypeScript with a modern component-based architecture:
- **UI Framework**: React with TypeScript for type safety
- **Component Library**: Radix UI primitives with shadcn/ui components for consistent design
- **Styling**: Tailwind CSS with CSS variables for theming support
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite for fast development and optimized production builds

## Backend Architecture
The backend follows an Express.js REST API pattern:
- **Runtime**: Node.js with TypeScript (ESM modules)
- **Framework**: Express.js for HTTP server and middleware
- **Authentication**: Replit Auth integration for user management
- **API Design**: RESTful endpoints with proper error handling and logging
- **Middleware**: CORS, JSON parsing, request logging, and authentication guards

## Data Storage Solutions
The application uses PostgreSQL with Drizzle ORM for type-safe database operations:
- **Database**: PostgreSQL via Neon serverless platform
- **ORM**: Drizzle ORM for schema definition and query building
- **Schema**: Comprehensive relational schema supporting users, files, categories, referrals, quizzes, and system settings
- **Migrations**: Drizzle Kit for database schema migrations
- **Connection**: Connection pooling via @neondatabase/serverless

## Authentication and Authorization
Authentication is handled through Replit's integrated auth system:
- **Provider**: Replit Auth for seamless user authentication
- **Session Management**: Secure session handling with proper middleware
- **Authorization**: Role-based access control with admin and user roles
- **Security**: Protected routes and API endpoints with authentication guards

## Core Business Logic
The application implements several key business workflows:
- **Account Submission**: Users can submit social media accounts with category-based pricing
- **Approval Workflow**: Admin review and approval system for submitted accounts
- **Earnings Calculation**: Dynamic rate calculation based on account categories
- **Referral System**: Multi-level referral tracking and commission calculation
- **Quiz System**: Daily quiz functionality with rewards and leaderboards
- **Withdrawal Management**: Payment processing for user earnings

# External Dependencies

## Google Services Integration
- **Google Sheets API**: For data synchronization and backup via service account authentication
- **Google Apps Script**: Server-side automation for data processing and validation
- **Service Account**: Authentication using credentials.json for secure API access

## Database and Infrastructure
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **WebSocket Support**: Real-time features via ws package for database connections

## Development and Build Tools
- **Vite**: Frontend build tool with HMR and optimization
- **Replit Integration**: Development environment optimizations and runtime error handling
- **TypeScript**: Type checking and compilation across the entire stack

## UI and Styling
- **Tailwind CSS**: Utility-first CSS framework with custom configuration
- **Radix UI**: Headless component primitives for accessibility
- **Lucide Icons**: Icon library for consistent iconography
- **Font Awesome**: Additional icon support for branding elements

## Form and Data Validation
- **Zod**: Schema validation for forms and API endpoints
- **React Hook Form**: Form state management with validation integration
- **Drizzle Zod**: Database schema validation integration

## Utility Libraries
- **date-fns**: Date manipulation and formatting
- **clsx/tailwind-merge**: Conditional CSS class management
- **nanoid**: Unique ID generation for various entities