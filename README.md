# SuperClip Backend

Backend service for "SuperClip," a desktop application that allows users to store, categorize, and manage AI prompts and command snippets.

## Tech Stack

- **Database**: PostgreSQL
- **ORM**: Prisma (for type-safe database access)
- **Backend Framework**: Express.js (Node.js)
- **Authentication**: JWT-based authentication for user management
- **Data Syncing**: RESTful API for CRUD operations

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update the database connection string and other variables
4. Set up the database:
   ```
   npm run prisma:migrate
   ```
5. Generate Prisma client:
   ```
   npm run prisma:generate
   ```
6. Start the development server:
   ```
   npm run dev
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Authenticate user and return JWT
- `GET /api/auth/me` - Retrieve authenticated user details (protected)

### Prompts

- `POST /api/prompts` - Create a new prompt (requires authentication)
- `GET /api/prompts` - Retrieve all prompts (requires authentication)
- `GET /api/prompts/:id` - Get a specific prompt
- `PUT /api/prompts/:id` - Update a prompt
- `DELETE /api/prompts/:id` - Delete a prompt

### Categories

- `POST /api/categories` - Create a category (requires authentication)
- `GET /api/categories` - Get all categories (requires authentication)
- `PUT /api/categories/:id` - Rename or update category
- `DELETE /api/categories/:id` - Delete category

### Search

- `GET /api/search?query=xyz` - Search prompts (requires authentication)

### Export

- `GET /api/export/csv` - Export all prompts as CSV (requires authentication)
- `GET /api/export/csv?category=xyz` - Export by category

### OpenAI Integration

- `POST /api/generate-prompt` - Uses OpenAI API to generate a prompt based on user input (requires authentication)

## Development

### Scripts

- `npm run dev` - Start development server with hot-reloading
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio to view/edit data

## License

ISC 