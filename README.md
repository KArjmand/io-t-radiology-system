<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<h1 align="center">IoT X-Ray Data Management System</h1>

<p align="center">
  A NestJS-based IoT data management system for processing X-Ray data from medical devices.
</p>

## Overview

This project is an IoT X-Ray Data Management System built with NestJS, RabbitMQ, and MongoDB. It processes X-Ray data from IoT medical devices, stores the processed data, and provides RESTful API endpoints for data retrieval and analysis with advanced filtering and pagination capabilities.

### Key Features

- **RabbitMQ Integration**: Receives X-Ray data from IoT devices via message queues
- **Data Processing**: Processes and validates incoming X-Ray data
- **MongoDB Storage**: Stores processed data in a MongoDB database
- **RESTful API**: Provides endpoints for CRUD operations with advanced filtering
- **Pagination**: Standardized pagination across all data retrieval endpoints
- **WebSockets**: Real-time processing status updates via Socket.IO
- **Producer Simulation**: Includes a module to simulate IoT devices sending X-Ray data
- **Swagger Documentation**: Auto-generated API documentation with validation

## System Architecture

```
┌─────────────┐     ┌───────────┐     ┌─────────────┐     ┌─────────────┐
│ IoT Devices │────▶│ RabbitMQ  │────▶│ NestJS App  │────▶│  MongoDB    │
│ (Producer)  │     │ (Queue)   │     │ (Consumer)  │     │ (Database)  │
└─────────────┘     └───────────┘     └─────────────┘     └─────────────┘
                                            │
                                            ▼
                                      ┌─────────────┐
                                      │  REST API   │
                                      │  Endpoints  │
                                      └─────────────┘
                                            │
                                            ▼
                                      ┌─────────────┐
                                      │ WebSockets  │
                                      │ (Real-time) │
                                      └─────────────┘
```

## Architectural Design

The application follows a clean architecture pattern with clear separation of concerns:

1. **Repository Layer**: Handles data access and persistence
   - Communicates directly with MongoDB
   - Returns raw data and count information

2. **Service Layer**: Contains business logic
   - Processes incoming data from RabbitMQ
   - Handles pagination of results
   - Manages WebSocket events

3. **Controller Layer**: Manages HTTP requests/responses
   - Provides RESTful endpoints
   - Handles input validation via DTOs
   - Returns standardized responses

## Prerequisites

Before running this project, make sure you have the following installed:

- Node.js (v14 or later)
- Yarn package manager
- MongoDB (local or remote instance)
- RabbitMQ (local or remote instance)

## Installation

```bash
# Clone the repository
$ git clone https://github.com/KArjmand/io-t-radiology-system

# Navigate to the project directory
$ cd io-t-radiology-system

# Install dependencies
$ yarn install
```

## Configuration

Create a `.env` file in the root directory with the following environment variables:

```env
# Port
PORT=3000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/xray-data

# RabbitMQ
RABBITMQ_DEFAULT_USER=admin
RABBITMQ_DEFAULT_PASS=admin123
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
```

## Running the Application

```bash
# Development mode
$ yarn start

# Watch mode (recommended for development)
$ yarn start:dev

# Production mode
$ yarn start:prod
```

## API Documentation

After starting the application, you can access the Swagger API documentation at:

```
http://localhost:3000/api
```

The Swagger UI provides a comprehensive interface to explore and test all available API endpoints. The API documentation is generated dynamically from code annotations.

### OpenAPI Specification

The OpenAPI specification includes detailed information about:

- All available endpoints and operations
- Input parameters and request bodies
- Response schemas and status codes
- Data models and DTOs

You can export the OpenAPI specification directly from the Swagger UI interface for use in tools like Postman or Insomnia.

### Available Endpoints

#### Signals API

- `GET /signals` - Get all signals with pagination
- `GET /signals/:id` - Get signal by ID
- `GET /signals/filter` - Filter signals by criteria with pagination
  - Supports filtering by deviceId, startTime, endTime
  - Includes standardized pagination (page, limit)
- `POST /signals` - Create a new signal
- `PUT /signals/:id` - Update a signal
- `DELETE /signals/:id` - Delete a signal

#### Producer API (Simulation)

- `POST /producer/send-sample` - Send sample X-Ray data to RabbitMQ
- `POST /producer/send-random` - Generate and send random X-Ray data
- `GET /producer/generate` - Generate random X-Ray data with optional deviceId

## Pagination

All list endpoints support standardized pagination:

```typescript
// Example request with pagination
GET /signals?page=2&limit=10

// Example response format
{
  "items": [...],  // Array of items for the current page
  "total": 45,    // Total number of items
  "page": 2,      // Current page
  "limit": 10,    // Items per page
  "totalPages": 5, // Total number of pages
  "hasNextPage": true,
  "hasPreviousPage": true
}
```

## WebSocket Testing

The project includes a WebSocket testing interface (`websocket-test.html`) that allows you to monitor real-time X-Ray signal processing events:

1. Start the application using `yarn start:dev`
2. Open the `websocket-test.html` file in your browser
3. The interface will automatically connect to the WebSocket server running on port 3000
4. You'll see real-time updates as X-Ray signals are processed:
   - **MessageReceived**: When a new message is received from RabbitMQ
   - **Processing**: During data processing
   - **Saved**: When data is successfully saved to MongoDB

This tool is particularly useful for debugging and monitoring the real-time data flow through the system.

## Testing

```bash
# Run unit tests
$ yarn test

# Run e2e tests
$ yarn test:e2e

# Generate test coverage report
$ yarn test:cov
```

## Project Structure

```
src/
├── app.module.ts            # Main application module
├── main.ts                  # Application entry point
├── common/                  # Shared utilities and DTOs
│   ├── dto/                 # Common DTOs
│   │   ├── pagination.dto.ts
│   │   └── paginated-response.dto.ts
│   └── utils/               # Utility functions
│       └── pagination.utils.ts
├── rabbitmq/               # RabbitMQ integration
│   ├── rabbitmq.module.ts
│   └── rabbitmq.service.ts
├── signals/                # X-Ray signals processing
│   ├── dto/                # Data Transfer Objects
│   │   ├── create-signal.dto.ts
│   │   ├── filter-signal.dto.ts
│   │   └── update-signal.dto.ts
│   ├── schemas/           # MongoDB schemas
│   │   └── xray.schema.ts
│   ├── signals.controller.ts
│   ├── signals.controller.spec.ts
│   ├── signals.module.ts
│   ├── signals.service.ts
│   ├── signals.service.spec.ts
│   └── xray.repository.ts  # Repository for data access
├── types/                 # TypeScript type definitions
│   └── index.ts           # Global type definitions
├── websocket/             # WebSocket functionality
│   ├── events.gateway.ts
│   └── websocket.module.ts
└── producer/              # Producer simulation
    ├── dto/               # Producer DTOs
    │   └── producer.dto.ts
    ├── producer.controller.ts
    ├── producer.module.ts
    └── producer.service.ts
```

### Root Files

```
├── Dockerfile             # Docker configuration
├── docker-compose.yml     # Docker Compose configuration
├── docker-compose-dev.yml # Development Docker Compose config
├── eslint.config.mjs      # ESLint configuration
├── nest-cli.json          # NestJS CLI configuration
├── package.json           # Node.js dependencies
├── README.md              # Project documentation
├── tsconfig.build.json    # TypeScript build config
├── tsconfig.json          # TypeScript configuration
├── websocket-test.html    # WebSocket testing interface
└── yarn.lock              # Yarn lock file
```

## Data Flow

1. **Data Generation**: X-Ray data is generated by IoT devices (simulated by the Producer module)
2. **Message Queue**: Data is sent to RabbitMQ queue 'xray_queue'
3. **Data Processing**: 
   - RabbitMQ consumer receives the data
   - Service processes and validates the data
   - WebSocket events are emitted for real-time monitoring
4. **Data Storage**: Processed data is stored in MongoDB via the repository
5. **Data Retrieval**: 
   - Repository fetches raw data and count
   - Service applies pagination
   - Controller returns standardized paginated responses

## Docker Support

A Docker Compose setup is available for easy deployment:

```bash
# Start the application with Docker Compose
$ docker-compose up -d

# Stop the application
$ docker-compose down
```

## Future Enhancements

### TODO

- [ ] **Authentication and Authorization**
  - Implement JWT-based authentication
  - Role-based access control (Admin, User, Device)
  - API key authentication for IoT devices

- [ ] **Advanced Filtering**
  - Add support for more complex query parameters
  - Implement full-text search capabilities
  - Add sorting options for all list endpoints

- [ ] **Performance Optimizations**
  - Add caching layer for frequently accessed data
  - Implement database indexing strategies
  - Add request rate limiting

- [ ] **Monitoring and Logging**
  - Integrate with monitoring tools (Prometheus, Grafana)
  - Enhanced logging with correlation IDs
  - Performance metrics collection

- [ ] **Deployment Enhancements**
  - Kubernetes deployment configuration
  - CI/CD pipeline setup
  - Environment-specific configuration

## License

This project is [MIT licensed](LICENSE).
