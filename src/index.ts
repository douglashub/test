import express from 'express';
import cors from 'cors';
import userRouter from './routes/user.routes';
import topicRouter from './routes/topic.routes';
import errorHandler from './middlewares/errorHandler.middleware';
import { topicRepository } from './config/services';
import { Topic } from './domain/entities/Topic';

export const app = express();
const port = process.env.PORT || 3000;

// Global middlewares
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  console.log(`${new Date().toISOString()} [REQUEST] ${req.method} ${req.url}`);
  
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Request body:', JSON.stringify(req.body));
  }
  
  const originalSend = res.send;
  const originalJson = res.json;
  let responseBody: any;
  
  res.send = function(body: any): express.Response {
    responseBody = body;
    return originalSend.call(this, body);
  };
  
  res.json = function(body: any): express.Response {
    responseBody = body;
    return originalJson.call(this, body);
  };
  
  const originalEnd = res.end;
  
  res.end = function(chunk?: any, ...args: any[]): any {
    const duration = Date.now() - start;

    let bodyToLog = responseBody || (chunk ? chunk.toString() : '');
    if (typeof bodyToLog === 'object') {
      bodyToLog = JSON.stringify(bodyToLog);
    }

    let bodyDisplay = '';
    if (bodyToLog && res.get('Content-Type')?.includes('application/json')) {
      bodyDisplay = `Body: ${typeof bodyToLog === 'string' ? 
        bodyToLog.substring(0, 1000) + (bodyToLog.length > 1000 ? '...' : '') : 
        JSON.stringify(bodyToLog).substring(0, 1000) + (JSON.stringify(bodyToLog).length > 1000 ? '...' : '')}`;
    }

    console.log(`${new Date().toISOString()} [RESPONSE] ${req.method} ${req.url}
      Status: ${res.statusCode}
      Duration: ${duration}ms
      ${bodyDisplay}`);

    return originalEnd.apply(this, arguments as any);
  };
  
  next();
});

// Register routes
app.use('/api/users', userRouter);
app.use('/api/topics', topicRouter);

// Global error handler should be last
app.use(errorHandler);

// Function to generate test data
async function generateTestData() {
  // Create topics
  const rootTopic = Topic.create('Root Topic', 'Main root topic', null);
  const childTopic1 = Topic.create('Child Topic 1', 'First child topic', rootTopic.getId());
  const childTopic2 = Topic.create('Child Topic 2', 'Second child topic', rootTopic.getId());
  const grandchildTopic = Topic.create('Grandchild Topic', 'Child of Child 1', childTopic1.getId());
  
  // Unconnected topic (no path to others)
  const unconnectedTopic = Topic.create('Unconnected Topic', 'No path to other topics', null);
  
  // Save to repository
  await topicRepository.save(rootTopic);
  await topicRepository.save(childTopic1);
  await topicRepository.save(childTopic2);
  await topicRepository.save(grandchildTopic);
  await topicRepository.save(unconnectedTopic);
  
  // Print IDs for testing
  console.log('Test data created with the following IDs:');
  console.log(`Root Topic: ${rootTopic.getId()}`);
  console.log(`Child Topic 1: ${childTopic1.getId()}`);
  console.log(`Child Topic 2: ${childTopic2.getId()}`);
  console.log(`Grandchild Topic: ${grandchildTopic.getId()}`);
  console.log(`Unconnected Topic: ${unconnectedTopic.getId()}`);
  
  // Print example curl commands
  console.log('\nTest this API with curl commands:');
  console.log(`\n# Get hierarchy for root topic:`);
  console.log(`curl -X GET http://localhost:${port}/api/topics/${rootTopic.getId()}/hierarchy`);
  
  console.log(`\n# Get hierarchy for non-existent topic:`);
  console.log(`curl -X GET http://localhost:${port}/api/topics/non-existent-id/hierarchy`);
  
  console.log(`\n# Find path from root to grandchild:`);
  console.log(`curl -X GET "http://localhost:${port}/api/topics/path?startId=${rootTopic.getId()}&endId=${grandchildTopic.getId()}"`);
  
  console.log(`\n# Find path with missing parameters:`);
  console.log(`curl -X GET http://localhost:${port}/api/topics/path`);
  
  console.log(`\n# Find path between unconnected topics:`);
  console.log(`curl -X GET "http://localhost:${port}/api/topics/path?startId=${rootTopic.getId()}&endId=${unconnectedTopic.getId()}"`);
}

// Start server
let server;
if (process.env.NODE_ENV !== 'test') {
  server = app.listen(port, async () => {
    console.log(`Server is running on port ${port}`);
    // Generate test data when server starts (not in test mode)
    await generateTestData();
  });
} else {
  // Create but don't start server during tests to avoid port conflicts
  server = require('http').createServer(app);
}

// Export server for testing
export { server };