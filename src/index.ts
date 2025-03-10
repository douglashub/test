import express from 'express';
import cors from 'cors';
import { TopicHierarchyService } from './domain/services/TopicHierarchyService';
import { InMemoryTopicRepository } from './infrastructure/repositories/InMemoryTopicRepository';
import { Topic } from './domain/entities/Topic';

export const app = express();
const port = process.env.PORT || 3000;

export const topicRepository = new InMemoryTopicRepository();
export const topicHierarchyService = new TopicHierarchyService(topicRepository);

app.use(cors());
app.use(express.json());

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

// Routes
app.get('/topics/:id/hierarchy', async (req, res) => {
  try {
    const topicId = req.params.id;
    // Check if topic exists before trying to get hierarchy
    const exists = await topicRepository.exists(topicId);
    if (!exists) {
      return res.status(404).json({ error: `Topic with id ${topicId} not found` });
    }
    
    const hierarchy = await topicHierarchyService.getTopicHierarchy(topicId);
    res.json(hierarchy);
  } catch (error) {
    // Log the error
    console.error('Error getting topic hierarchy:', error);
    
    // Check if this is a "not found" error
    if (error instanceof Error && error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Something went wrong!' });
  }
});

app.get('/topics/path', async (req, res) => {
  try {
    const { startId, endId } = req.query;
    if (!startId || !endId || typeof startId !== 'string' || typeof endId !== 'string') {
      return res.status(400).json({ error: 'startId and endId are required query parameters' });
    }

    try {
      const path = await topicHierarchyService.findShortestPath(startId, endId);
      res.json({ path });
    } catch (pathError) {
      // Return 404 for any path error
      return res.status(404).json({ error: pathError instanceof Error ? pathError.message : 'No path found' });
    }
  } catch (error) {
    // Log the error
    console.error('Error finding path:', error);
    
    // Return 500 for unexpected errors
    res.status(500).json({ error: 'Something went wrong!' });
  }
});

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
  console.log(`curl -X GET http://localhost:${port}/topics/${rootTopic.getId()}/hierarchy`);
  
  console.log(`\n# Get hierarchy for non-existent topic:`);
  console.log(`curl -X GET http://localhost:${port}/topics/non-existent-id/hierarchy`);
  
  console.log(`\n# Find path from root to grandchild:`);
  console.log(`curl -X GET "http://localhost:${port}/topics/path?startId=${rootTopic.getId()}&endId=${grandchildTopic.getId()}"`);
  
  console.log(`\n# Find path with missing parameters:`);
  console.log(`curl -X GET http://localhost:${port}/topics/path`);
  
  console.log(`\n# Find path between unconnected topics:`);
  console.log(`curl -X GET "http://localhost:${port}/topics/path?startId=${rootTopic.getId()}&endId=${unconnectedTopic.getId()}"`);
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