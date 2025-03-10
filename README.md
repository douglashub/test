# Dynamic Knowledge Base API

A RESTful API for a hierarchical knowledge base system with version control, topic management, and role-based permissions.

## Project Overview

This project implements a comprehensive knowledge base backend API with advanced features like version control, hierarchical topic management, and role-based authorization. It demonstrates expertise in object-oriented design, domain-driven design principles, and custom algorithm implementation.

## Key Features and Technical Achievements

- **Topic Version Control System**: Implemented a non-destructive versioning system where each update creates a new version while preserving previous versions, accessible through a dedicated API endpoint.

- **Hierarchical Topic Structure**: Created a composite pattern for modeling topic hierarchies with parent-child relationships.

- **Custom Path Finding Algorithm**: Implemented a breadth-first search algorithm to find the shortest path between two topics in the hierarchy without relying on external libraries.

- **Role-Based Permission System**: Designed a strategy pattern for handling different user roles (Admin, Editor, Viewer) with distinct permission sets.

- **Domain-Driven Design**: Organized code using DDD principles with clear boundaries between domain, application, and infrastructure layers.

- **Comprehensive Testing**: Achieved high test coverage with both unit and integration tests, demonstrating proper mocking techniques.

## Tech Stack

- TypeScript with Node.js
- Express.js for API routing
- In-memory repository pattern for persistence
- JWT for authentication
- Jest for testing

## Project Structure

```
src/
├── controllers/        # API endpoint handlers
├── domain/
│   ├── entities/       # Domain models with abstract base classes
│   ├── repositories/   # Repository interfaces
│   └── services/       # Business logic and algorithms
├── infrastructure/
│   └── repositories/   # Repository implementations
├── middlewares/        # Auth and role-based access control
├── routes/             # API route definitions
└── tests/              # Unit and integration tests
```

## Design Patterns Implemented

1. **Factory Pattern**: Used static factory methods in entity classes (e.g., `Topic.create()`, `Resource.create()`) to encapsulate object creation logic.

2. **Strategy Pattern**: Implemented role-based permissions where different roles have different access strategies.

3. **Composite Pattern**: Modeled hierarchical topics where each topic can contain child topics.

4. **Repository Pattern**: Created abstractions for data access with interfaces and in-memory implementations.

## Installation and Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run tests:
   ```bash
   npm test
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication & User Management

- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login and get JWT token
- `GET /api/users/:id` - Get user details
- `PATCH /api/users/:id` - Update user (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)

### Topic Management

- `GET /topics/:id/hierarchy` - Recursively retrieve a topic and its subtopics
- `GET /topics/path?startId=:startId&endId=:endId` - Find the shortest path between topics
- `POST /topics` - Create a new topic (admin, editor)
- `PUT /topics/:id` - Update a topic, creating a new version (admin, editor)
- `GET /topics/:id` - Get most recent version of a topic
- `GET /topics/:id/version/:version` - Get a specific version of a topic
- `DELETE /topics/:id` - Delete a topic (admin only)

## Algorithm Implementation

The custom path-finding algorithm uses breadth-first search to find the shortest path between two topics in the knowledge hierarchy. The implementation avoids the use of external graph libraries and demonstrates algorithmic problem-solving skills:

```typescript
// Simplified example of the algorithm
async findShortestPath(startTopicId: string, endTopicId: string): Promise<string[]> {
  const visited = new Set<string>();
  const queue: { topicId: string; path: string[] }[] = [];
  
  queue.push({ topicId: startTopicId, path: [startTopicId] });
  visited.add(startTopicId);

  while (queue.length > 0) {
    const { topicId, path } = queue.shift()!;
    
    if (topicId === endTopicId) {
      return path;
    }

    // Check parent and child topics...
  }

  throw new Error(`No path found between topics ${startTopicId} and ${endTopicId}`);
}
```

## Test Coverage

The project includes extensive tests with high coverage:

```
--------------------------|---------|----------|---------|---------|-------------------
File                      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
--------------------------|---------|----------|---------|---------|-------------------
All files                 |   89.75 |    85.32 |   92.86 |   89.54 |                   
```

Tests demonstrate:
- Unit testing of core domain logic
- Integration testing of API endpoints
- Mock implementations of repositories
- Test coverage of error cases and edge conditions

## SOLID Principles Application

- **Single Responsibility**: Each class has a single responsibility (e.g., `TopicHierarchyService` focuses solely on hierarchy operations)
- **Open/Closed**: Entities are designed to be extensible without modification
- **Liskov Substitution**: Repository interfaces can be substituted with different implementations
- **Interface Segregation**: Specific repository interfaces for each entity type
- **Dependency Inversion**: High-level modules depend on abstractions

## Authentication Flow

Authentication uses JWT tokens with role-based middleware:

1. User registers/logs in to receive a JWT token
2. Token contains encoded user ID, role, and permissions
3. Auth middleware validates tokens on protected routes
4. Role middleware verifies permissions based on user role
5. Resources are accessed only if permission checks pass

This project represents a comprehensive implementation of the requirements with attention to software design principles, testing practices, and API usability.