# Dynamic Knowledge Base API

A RESTful API for a hierarchical knowledge base system with version control, topic management, and role-based permissions.

## Features

- **Topic Management**: Create, read, update, and delete topics with version control
- **Hierarchical Structure**: Topics can have parent-child relationships
- **Resource Management**: Associate resources (links, documents) with topics
- **User Authentication**: JWT-based authentication system
- **Role-Based Authorization**: Admin, Editor, and Viewer roles with different permissions
- **Path Finding Algorithm**: Custom algorithm to find the shortest path between topics

## Tech Stack

- Node.js with TypeScript
- Express.js for API routing
- In-memory database for persistence
- JWT for authentication
- Jest for testing

## Project Structure

```
src/
├── controllers/        # API endpoint handlers
├── domain/
│   ├── entities/       # Domain models (Topic, Resource, User)
│   ├── repositories/   # Interfaces for data access
│   └── services/       # Business logic
├── infrastructure/
│   └── repositories/   # Implementation of repositories
├── middlewares/        # Express middlewares
├── routes/             # API route definitions
└── tests/              # Integration and unit tests
```

## Installation

1. Clone the repository
2. Install dependencies

```bash
npm install
```

3. Start the development server

```bash
npm run dev
```

## API Endpoints

### Authentication

- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login and get a JWT token

### Users

- `GET /api/users/:id` - Get user details (all authenticated users)
- `PATCH /api/users/:id` - Update user (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)

### Topics

- `GET /topics/:id/hierarchy` - Get a topic and all its children recursively
- `GET /topics/path?startId=:startId&endId=:endId` - Find the shortest path between two topics
- `POST /topics` - Create a new topic (admin, editor)
- `GET /topics/:id` - Get a topic by ID
- `PUT /topics/:id` - Update a topic (admin, editor)
- `DELETE /topics/:id` - Delete a topic (admin only)

## User Roles and Permissions

- **Admin**: Can perform all operations, including user management
- **Editor**: Can create, read, and update topics, but cannot delete them or manage users
- **Viewer**: Can only read topics and resources

## Running Tests

```bash
npm test
```

For code coverage report:

```bash
npm run test:coverage
```

## Design Patterns Used

- **Factory Pattern**: Static create methods in entity classes
- **Strategy Pattern**: Role-based permission system
- **Composite Pattern**: Topic hierarchy representation
- **Repository Pattern**: Abstraction for data access

## Domain-Driven Design

The project follows DDD principles with a clear separation between:
- Domain entities
- Repository interfaces
- Application services
- Infrastructure implementations

## Version Control for Topics

Each update to a topic creates a new version rather than overwriting the existing data. This maintains a history of changes and allows retrieving previous versions.

## Example Usage

### Authentication

```bash
# Register a new admin user
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin User", "email":"admin@example.com", "password":"password", "role":"ADMIN"}'

# Login to get JWT token
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com", "password":"password"}'
```

### Topics

```bash
# Get topic hierarchy
curl -X GET http://localhost:3000/topics/{topicId}/hierarchy

# Find path between topics
curl -X GET "http://localhost:3000/topics/path?startId={startTopicId}&endId={endTopicId}"
```