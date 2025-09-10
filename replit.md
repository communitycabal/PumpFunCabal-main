# replit.md

## Overview

Community Cabal ($CC) is a decentralized token pumping platform built on Solana that enables community-driven token promotion through a voting and automated pumping system. Users can submit Solana token contract addresses, vote on submissions, and the system automatically executes pump transactions on the highest-voted tokens at regular intervals.

The application features a modern React frontend with real-time countdown timers, submission forms, voting interfaces, and pump history tracking. The backend provides RESTful APIs for managing submissions, votes, and pump history with PostgreSQL data persistence.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript and Vite for fast development and building
- **UI Components**: Radix UI primitives with shadcn/ui component library for consistent, accessible design
- **Styling**: Tailwind CSS with custom dark theme and CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation for type-safe form handling

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful APIs with JSON responses
- **Validation**: Zod schemas for request/response validation
- **Development**: Hot reload with Vite middleware integration
- **Storage Abstraction**: Interface-based storage layer supporting both in-memory and database implementations

### Database Architecture
- **Database**: PostgreSQL with connection pooling via Neon serverless
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Tables**: 
  - `submissions`: Token contract submissions with voting counts
  - `votes`: Individual vote records with voter tracking
  - `pump_history`: Historical pump transaction records

### Authentication & Security
- **Wallet Integration**: Solana wallet connection (mocked in current implementation)
- **Validation**: Solana address format validation
- **Duplicate Prevention**: Contract address uniqueness constraints
- **Rate Limiting**: Voter address tracking to prevent duplicate votes per submission

### Core Features
- **Token Submission**: Submit Solana contract addresses with automatic token metadata generation
- **Community Voting**: Vote on submitted tokens with duplicate vote prevention
- **Automated Pumping**: Scheduled pump transactions on highest-voted submissions
- **Real-time Updates**: Live countdown timer and vote count updates
- **Pump History**: Transaction history with price impact tracking

## External Dependencies

### Frontend Dependencies
- **@radix-ui/react-***: Accessible UI component primitives for dialogs, buttons, forms, etc.
- **@tanstack/react-query**: Server state management and caching
- **@hookform/resolvers**: Form validation integration
- **wouter**: Lightweight routing library
- **lucide-react**: Icon library
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe variant styling
- **date-fns**: Date manipulation utilities

### Backend Dependencies
- **express**: Web application framework
- **drizzle-orm**: TypeScript ORM for database operations
- **@neondatabase/serverless**: Serverless PostgreSQL connection
- **drizzle-zod**: Zod integration for schema validation
- **zod**: Runtime type validation and parsing
- **connect-pg-simple**: PostgreSQL session store

### Development Tools
- **vite**: Build tool and development server
- **typescript**: Type checking and compilation
- **drizzle-kit**: Database migration and introspection tools
- **esbuild**: Fast JavaScript bundler for production builds
- **tsx**: TypeScript execution for development

### Infrastructure
- **Neon Database**: Serverless PostgreSQL hosting
- **Replit**: Development environment and hosting platform
- **Solana Blockchain**: Target blockchain for token operations (integration pending)