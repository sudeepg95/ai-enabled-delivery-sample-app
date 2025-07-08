# User Authentication API

A RESTful API for user authentication and task management built with Node.js, TypeScript, Express, and MySQL.

## Tech Stack

- Node.js v20.x.x
- TypeScript 5
- Express
- MySQL
- JWT Authentication
- BCrypt for password hashing
- OpenAPI/Swagger for documentation
- Jest for testing
- ESLint with TypeScript plugin

## Features

- User registration and authentication
- JWT-based authentication
- Secure password hashing with BCrypt
- API documentation with Swagger
- Environment-based configuration
- Error handling middleware
- Database connection pooling

## Getting Started

### Prerequisites

- Node.js v20.x.x
- MySQL Server

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd <repository-directory>
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables:

Copy the `.env.example` file to `.env` and update the values:

```bash
cp .env.example .env
```

4. Initialize the database:

```bash
npm run db:init
```

5. Build the application:

```bash
npm run build
```

6. Start the server:

```bash
npm start
```

For development with hot-reloading:

```bash
npm run dev
```

## API Endpoints

| Method | Path      | Description                      | Authentication Required |
|--------|-----------|----------------------------------|-------------------------|
| POST   | /register | Register a new user              | No                      |
| POST   | /login    | Authenticate and return JWT      | No                      |
| GET    | /me       | Return current authenticated user| Yes                     |

## API Documentation

API documentation is available at `/api-docs` when the server is running.

## Testing

Run tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

## Linting

Run ESLint:

```bash
npm run lint
```

Fix ESLint issues:

```bash
npm run lint:fix
```

## Project Structure

```
.
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Express middleware
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── tests/          # Test files
│   ├── utils/          # Utility functions
│   └── index.ts        # Application entry point
├── .env                # Environment variables
├── .env.example        # Example environment variables
├── .eslintrc.js        # ESLint configuration
├── .gitignore          # Git ignore file
├── jest.config.js      # Jest configuration
├── package.json        # Project dependencies
├── tsconfig.json       # TypeScript configuration
└── README.md           # Project documentation
```

## License

ISC