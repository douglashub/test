import request from 'supertest';
import http from 'http';
import express from 'express';
import cors from 'cors';
import { Topic } from '../../domain/entities/Topic';
import { InMemoryTopicRepository } from '../../infrastructure/repositories/InMemoryTopicRepository';
import { TopicHierarchyService } from '../../domain/services/TopicHierarchyService';

// Create a separate app and server for testing
const app = express();
const topicRepository = new InMemoryTopicRepository();
const topicHierarchyService = new TopicHierarchyService(topicRepository);
let server: http.Server;

// Set up middleware and routes for testing
app.use(cors());
app.use(express.json());

// Add the same routes that are in your index.ts
app.get('/topics/:id/hierarchy', async (req, res) => {
  try {
    const topicId = req.params.id;
    // Check if topic exists first
    const exists = await topicRepository.exists(topicId);
    if (!exists) {
      return res.status(404).json({ error: `Topic with id ${topicId} not found` });
    }
    
    const hierarchy = await topicHierarchyService.getTopicHierarchy(topicId);
    res.json(hierarchy);
  } catch (error) {
    console.error('Error getting topic hierarchy:', error);
    
    // Check if error message contains "not found" to return 404
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
    console.error('Error finding path:', error);
    res.status(500).json({ error: 'Something went wrong!' });
  }
});

describe('API Integration Tests', () => {
  beforeAll((done) => {
    // Set timeout for all tests
    jest.setTimeout(10000);
    
    // Start the server for testing
    server = app.listen(0, () => {
      done();
    });
  });

  afterAll((done) => {
    // Close the server after all tests
    server.close(() => {
      done();
    });
  });

  beforeEach(async () => {
    // Clear the repository before each test by creating a new instance
    Object.assign(topicRepository, new InMemoryTopicRepository());
  });

  describe('GET /topics/:id/hierarchy', () => {
    it('should return topic hierarchy for existing topic', async () => {
      // Create test data
      const rootTopic = Topic.create('Root', 'Root topic', null);
      const childTopic = Topic.create('Child', 'Child topic', rootTopic.getId());
      await topicRepository.save(rootTopic);
      await topicRepository.save(childTopic);

      const response = await request(app)
        .get(`/topics/${rootTopic.getId()}/hierarchy`)
        .expect(200);

      expect(response.body).toEqual({
        id: rootTopic.getId(),
        name: 'Root',
        version: 1,
        children: [
          {
            id: childTopic.getId(),
            name: 'Child',
            version: 1,
            children: []
          }
        ]
      });
    });

    it('should return 404 for non-existent topic', async () => {
      await request(app)
        .get('/topics/non-existent-id/hierarchy')
        .expect(404);
    });
  });

  describe('GET /topics/path', () => {
    it('should find shortest path between two topics', async () => {
      // Create test data
      const rootTopic = Topic.create('Root', 'Root topic', null);
      const childTopic = Topic.create('Child', 'Child topic', rootTopic.getId());
      const targetTopic = Topic.create('Target', 'Target topic', childTopic.getId());
      
      await topicRepository.save(rootTopic);
      await topicRepository.save(childTopic);
      await topicRepository.save(targetTopic);

      const response = await request(app)
        .get('/topics/path')
        .query({
          startId: rootTopic.getId(),
          endId: targetTopic.getId()
        })
        .expect(200);

      expect(response.body).toEqual({
        path: [
          rootTopic.getId(),
          childTopic.getId(),
          targetTopic.getId()
        ]
      });
    });

    it('should return 400 for missing query parameters', async () => {
      await request(app)
        .get('/topics/path')
        .expect(400);
    });

    it('should return 404 when no path exists', async () => {
      const topic1 = Topic.create('Topic 1', 'Topic 1', null);
      const topic2 = Topic.create('Topic 2', 'Topic 2', null);
      
      await topicRepository.save(topic1);
      await topicRepository.save(topic2);

      await request(app)
        .get('/topics/path')
        .query({
          startId: topic1.getId(),
          endId: topic2.getId()
        })
        .expect(404);
    });
  });
});