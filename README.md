# Knowledge Base Topic Management System

A RESTful API service for managing hierarchical topics in a knowledge base system. This service allows you to organize topics in a tree structure and find relationships between topics.

## Features

- **Topic Hierarchy Management**: Create and manage topics in a hierarchical structure
- **Path Finding**: Find the shortest path between any two topics in the hierarchy
- **Versioning**: Built-in support for topic versioning
- **RESTful API**: Clean and well-documented API endpoints
- **Comprehensive Logging**: Detailed request/response logging with timing information

## Getting Started

### Prerequisites

- Node.js
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```

The server will start on port 3000 (or the port specified in the PORT environment variable).

## API Documentation

### Get Topic Hierarchy

```http
GET /topics/:id/hierarchy
```

Returns the complete hierarchy tree starting from the specified topic.

#### Response

```json
{
  "id": "topic-id",
  "name": "Topic Name",
  "version": 1,
  "children": [
    {
      "id": "child-topic-id",
      "name": "Child Topic Name",
      "version": 1,
      "children": []
    }
  ]
}
```

### Find Path Between Topics

```http
GET /topics/path?startId={startId}&endId={endId}
```

Finds the shortest path between two topics in the hierarchy.

#### Response

```json
{
  "path": ["start-topic-id", "intermediate-topic-id", "end-topic-id"]
}
```

## Error Handling

The API uses standard HTTP status codes:

- `200`: Success
- `400`: Bad Request (e.g., missing parameters)
- `404`: Not Found (topic doesn't exist or no path found)
- `500`: Internal Server Error

## Testing

The project includes both unit and integration tests. Run the test suite with:

```bash
npm test
```

## Development

### Project Structure

```
src/
  ├── domain/
  │   ├── entities/      # Core business entities
  │   ├── repositories/  # Repository interfaces
  │   └── services/      # Business logic
  ├── infrastructure/
  │   └── repositories/  # Repository implementations
  ├── tests/
  │   └── integration/   # Integration tests
  └── index.ts          # Application entry point
```

### Test Data

When starting the server in non-test mode, it automatically generates test data with example topics and relationships. The server outputs the generated topic IDs and example curl commands for testing the API.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.