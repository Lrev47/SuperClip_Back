# SuperClip Backend

Backend API for the SuperClip application, a versatile clipboard management system.

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- TypeScript
- VS Code (recommended IDE)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Lrev47/SuperClip_Back.git
   cd SuperClip_Back
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Setup environment variables:

   ```bash
   cp .env.example .env
   ```

   And edit the `.env` file as needed.

4. Start the development server:
   ```bash
   npm run dev
   ```

The API will be available at http://localhost:3000, and the Swagger documentation at http://localhost:3000/api-docs.

## Development Workflow

### VS Code Setup

This project includes a `.vscode` folder with recommended settings to enhance your development experience. When you open the project in VS Code, it will suggest installing the recommended extensions.

Key features enabled:

- Format on save using Prettier
- ESLint integration with TypeScript
- Debug configurations for server and tests
- Useful extensions for TypeScript development

### Available Scripts

- `npm start` - Start the server in production mode
- `npm run dev` - Start the server in development mode with hot reload
- `npm run build` - Build the TypeScript code
- `npm test` - Run all tests
- `npm run test:unit` - Run unit tests
- `npm run test:integration` - Run integration tests
- `npm run lint` - Check code with ESLint
- `npm run lint:fix` - Fix code with ESLint
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check formatting with Prettier

### Code Style & Formatting

This project uses:

- ESLint for code linting
- Prettier for code formatting
- TypeScript for type checking

The ESLint configuration extends from:

- eslint:recommended
- plugin:@typescript-eslint/recommended
- plugin:@typescript-eslint/recommended-requiring-type-checking
- airbnb-typescript/base
- prettier

When you save a file in VS Code, it will be automatically formatted by Prettier and linted by ESLint.

## Project Structure

```
/src
  /docs         # API documentation (Swagger)
  /middleware   # Express middleware
  /routes       # API routes
  app.ts        # Express application
  server.ts     # HTTP server

/tests
  /unit         # Unit tests
  /integration  # Integration tests
```

## API Documentation

The API is documented using Swagger UI. When the server is running, you can access the documentation at:

http://localhost:3000/api-docs

## Testing

The project uses Jest for testing. The tests are organized into:

- Unit tests: `/tests/unit`
- Integration tests: `/tests/integration`

To run the tests:

```bash
npm test
```
