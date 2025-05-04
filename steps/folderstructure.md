# SuperClip Backend Folder Structure

This document outlines the folder structure of the SuperClip backend application and explains the purpose of each directory.

## Root Structure

```
SuperClip_Back/
├── src/               # Source code
├── dist/              # Compiled TypeScript output
├── prisma/            # Prisma schema and migrations
│   ├── schema.prisma  # Database schema
│   ├── migrations/    # Database migrations
│   └── seed.ts        # Seed data for development
├── tests/             # Test files
├── srcSudo/           # Planning documents for implementation
├── steps/             # Development process documentation
├── testConfig/        # Test configuration files
├── node_modules/      # Dependencies (git-ignored)
├── .env               # Environment variables (git-ignored)
├── .env.test          # Test environment variables (git-ignored)
├── .gitignore         # Git ignore file
├── package.json       # Project metadata and dependencies
├── tsconfig.json      # TypeScript configuration
├── jest.config.js     # Jest test configuration
└── README.md          # Project overview
```

## Comprehensive Source Code Structure (`src/`)

Based on the Prisma schema and project requirements, here's a detailed folder structure:

```
src/
├── app.ts                     # Express application setup
├── server.ts                  # Server initialization and configuration
│
├── config/                    # Configuration files
│   ├── index.ts               # Exports all configuration
│   ├── database.ts            # Database configuration
│   ├── auth.ts                # Authentication configuration
│   ├── stripe.ts              # Stripe API configuration
│   ├── logger.ts              # Logging configuration
│   └── constants.ts           # Application constants
│
├── middleware/                # Express middleware
│   ├── index.ts               # Exports all middleware
│   ├── error.middleware.ts    # Error handling middleware
│   ├── auth.middleware.ts     # Authentication middleware
│   ├── subscription.middleware.ts # Subscription check middleware
│   ├── security.middleware.ts # Security-related middleware
│   ├── validation.middleware.ts # Request validation middleware
│   └── logging.middleware.ts  # Request logging middleware
│
├── routes/                    # API routes
│   ├── index.ts               # Route registration
│   └── api/                   # API endpoints by version
│       └── v1/                # API version 1
│           ├── index.ts       # v1 route aggregation
│           ├── auth.routes.ts # Authentication routes
│           ├── users.routes.ts # User management routes
│           ├── clips.routes.ts # Clip management routes
│           ├── folders.routes.ts # Folder management routes
│           ├── tags.routes.ts # Tag management routes
│           ├── sets.routes.ts # Clipboard sets routes
│           ├── templates.routes.ts # AI prompt templates routes
│           ├── devices.routes.ts # Device management routes
│           ├── sync.routes.ts # Synchronization routes
│           └── subscription.routes.ts # Subscription management routes
│
├── controllers/               # Request handlers
│   ├── index.ts               # Exports all controllers
│   ├── auth.controller.ts     # Authentication controllers
│   ├── user.controller.ts     # User management controllers
│   ├── clip.controller.ts     # Clip management controllers
│   ├── folder.controller.ts   # Folder management controllers
│   ├── tag.controller.ts      # Tag management controllers
│   ├── set.controller.ts      # Clipboard set controllers
│   ├── template.controller.ts # AI prompt template controllers
│   ├── device.controller.ts   # Device management controllers
│   ├── sync.controller.ts     # Synchronization controllers
│   └── subscription.controller.ts # Subscription management controllers
│
├── services/                  # Business logic
│   ├── index.ts               # Exports all services
│   ├── auth.service.ts        # Authentication services
│   ├── user.service.ts        # User management services
│   ├── clip.service.ts        # Clip management services
│   ├── folder.service.ts      # Folder management services
│   ├── tag.service.ts         # Tag management services
│   ├── set.service.ts         # Clipboard set services
│   ├── template.service.ts    # AI prompt template services
│   ├── device.service.ts      # Device management services
│   ├── sync.service.ts        # Synchronization services
│   ├── search.service.ts      # Search functionality
│   ├── stripe.service.ts      # Stripe payment services
│   └── subscription.service.ts # Subscription management services
│
├── repositories/              # Data access layer
│   ├── index.ts               # Exports all repositories
│   ├── user.repository.ts     # User data operations
│   ├── clip.repository.ts     # Clip data operations
│   ├── folder.repository.ts   # Folder data operations
│   ├── tag.repository.ts      # Tag data operations
│   ├── set.repository.ts      # Clipboard set data operations
│   ├── template.repository.ts # AI prompt template data operations
│   ├── device.repository.ts   # Device data operations
│   └── subscription.repository.ts # Subscription data operations
│
├── models/                    # Enhanced data models
│   ├── index.ts               # Exports all models
│   └── interfaces/            # Model interfaces
│       ├── user.interface.ts  # User model interfaces
│       ├── clip.interface.ts  # Clip model interfaces
│       ├── folder.interface.ts # Folder model interfaces
│       ├── tag.interface.ts   # Tag model interfaces
│       ├── set.interface.ts   # Clipboard set interfaces
│       ├── template.interface.ts # AI prompt template interfaces
│       ├── device.interface.ts # Device model interfaces
│       └── subscription.interface.ts # Subscription model interfaces
│
├── dto/                       # Data Transfer Objects
│   ├── index.ts               # Exports all DTOs
│   ├── auth.dto.ts            # Authentication DTOs
│   ├── user.dto.ts            # User DTOs
│   ├── clip.dto.ts            # Clip DTOs
│   ├── folder.dto.ts          # Folder DTOs
│   ├── tag.dto.ts             # Tag DTOs
│   ├── set.dto.ts             # Clipboard set DTOs
│   ├── template.dto.ts        # AI prompt template DTOs
│   ├── device.dto.ts          # Device DTOs
│   └── subscription.dto.ts    # Subscription DTOs
│
├── utils/                     # Utility functions
│   ├── index.ts               # Exports all utilities
│   ├── async-handler.ts       # Async error handling
│   ├── error.ts               # Error classes and utilities
│   ├── encryption.ts          # Encryption utilities
│   ├── validation.ts          # Validation helpers
│   ├── pagination.ts          # Pagination utilities
│   ├── date.ts                # Date manipulation utilities
│   └── logger.ts              # Logging utilities
│
├── types/                     # TypeScript type definitions
│   ├── index.ts               # Exports all types
│   ├── express.d.ts           # Express type extensions
│   ├── environment.d.ts       # Environment variable types
│   └── common.ts              # Common type definitions
│
└── websockets/                # WebSocket functionality for real-time sync
    ├── index.ts               # WebSocket initialization
    ├── handlers/              # WebSocket event handlers
    │   ├── auth.handler.ts    # Authentication event handlers
    │   ├── sync.handler.ts    # Synchronization event handlers
    │   └── notification.handler.ts # Notification event handlers
    └── middleware/            # WebSocket middleware
        ├── auth.middleware.ts # WebSocket authentication
        └── validation.middleware.ts # WebSocket data validation
```

## Tests (`tests/`)

```
tests/
├── unit/                       # Unit tests
│   ├── services/               # Service unit tests
│   │   ├── auth.service.test.ts
│   │   ├── user.service.test.ts
│   │   ├── clip.service.test.ts
│   │   └── ...
│   ├── controllers/            # Controller unit tests
│   │   ├── auth.controller.test.ts
│   │   ├── user.controller.test.ts
│   │   └── ...
│   ├── middleware/             # Middleware unit tests
│   │   ├── auth.middleware.test.ts
│   │   ├── error.middleware.test.ts
│   │   └── ...
│   └── utils/                  # Utilities unit tests
│       ├── encryption.test.ts
│       ├── validation.test.ts
│       └── ...
│
├── integration/                # Integration tests
│   ├── api/                    # API route tests
│   │   ├── auth.routes.test.ts
│   │   ├── user.routes.test.ts
│   │   ├── clip.routes.test.ts
│   │   └── ...
│   ├── repositories/           # Repository integration tests
│   │   ├── user.repository.test.ts
│   │   ├── clip.repository.test.ts
│   │   └── ...
│   └── websockets/             # WebSocket integration tests
│       ├── auth.test.ts
│       ├── sync.test.ts
│       └── ...
│
└── e2e/                        # End-to-end tests
    ├── auth.test.ts            # Complete auth flow tests
    ├── clip-management.test.ts # Complete clip management flow
    ├── sync.test.ts            # Complete sync flow
    └── subscription.test.ts    # Complete subscription flow
```

## Test Configuration (`testConfig/`)

```
testConfig/
├── setupTests.ts      # Global test setup
└── testUtils.ts       # Test utilities
```

## Development Documentation (`srcSudo/`)

```
srcSudo/
├── README.md          # Overview of the planning documents
├── app.md             # Planning for app.ts
├── server.md          # Planning for server.ts
├── middleware.md      # Planning for middleware
├── template.md        # Template for planning documents
└── ...
```

## Development Steps (`steps/`)

```
steps/
├── README.md          # Overview of development steps
├── folderstructure.md # This file
└── ...                # Additional step documentation
```

## Conventions

1. **File Naming**: Use camelCase for files and kebab-case for directories
2. **Extensions**: 
   - `.ts` for TypeScript files
   - `.test.ts` for test files
   - `.d.ts` for TypeScript declaration files
   - `.md` for documentation
3. **Exports**: 
   - Use named exports for most files
   - Use default exports for main components like app.ts
4. **Imports**: Group imports by:
   - Node.js built-in modules
   - External dependencies
   - Internal modules

## Implementation Guidelines

1. Each component should have a corresponding test file
2. Maintain separation of concerns between layers:
   - Controllers handle HTTP-specific logic
   - Services handle business logic
   - Repositories handle data access
   - DTOs handle data transfer object validation
3. Use dependency injection where appropriate
4. Follow test-driven development (TDD) approach
5. Use repository pattern to abstract database operations
6. Prefer composition over inheritance
7. Keep services stateless
8. Use interfaces to define contracts between layers
9. Follow RESTful principles for API design
10. Use the API-first approach with proper OpenAPI documentation 