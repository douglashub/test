import express from 'express';
import cors from 'cors';
import { TopicHierarchyService } from './domain/services/TopicHierarchyService';
import { InMemoryTopicRepository } from './infrastructure/repositories/InMemoryTopicRepository';

export const app = express();
const port = process.env.PORT || 3000;

// Initialize repositories and services
export const topicRepository = new InMemoryTopicRepository();
export const topicHierarchyService = new TopicHierarchyService(topicRepository);

// Middleware
app.use(cors());
app.use(express.json());

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

// Start server
let server;
if (process.env.NODE_ENV !== 'test') {
  server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
} else {
  // Create but don't start server during tests to avoid port conflicts
  server = require('http').createServer(app);
}

// Export server for testing
export { server };