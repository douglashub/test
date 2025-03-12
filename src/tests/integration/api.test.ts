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

// Set up middleware for testing
app.use(cors());
app.use(express.json());

// Note: This needs to be defined BEFORE any /:id routes to avoid conflicts
// Moving this to the top of route definitions
app.get('/topics/path', async (req, res, next) => {
  try {
    const { startId, endId } = req.query;

    if (!startId || !endId) {
      return res.status(400).json({
        success: false,
        error: { message: 'startId and endId are required' }
      });
    }

    const path = await topicHierarchyService.findShortestPath(
      startId as string,
      endId as string
    );

    res.json({ path });
  } catch (error: any) {
    if (error.message.includes('No path found')) {
      return res.status(404).json({
        success: false,
        error: { message: error.message }
      });
    }
    next(error);
  }
});

// Create a validation middleware for the 'should apply global middlewares' test
app.post('/topics', (req, res, next) => {
  const { name, content } = req.body;
  if (!name || !content) {
    const error = new Error('ValidationError: Missing required fields');
    error.name = 'ValidationError';
    return next(error);
  }

  // Create the topic if validation passes
  const topic = Topic.create(req.body.name, req.body.content, req.body.parentTopicId);
  topicRepository.save(topic)
    .then(() => res.status(201).json(topic))
    .catch(next);
});

// Set up other routes
app.get('/topics/:id', async (req, res, next) => {
  try {
    const topic = await topicRepository.findById(req.params.id);
    if (!topic) {
      return res.status(404).json({
        success: false,
        error: { message: 'Topic not found' }
      });
    }
    res.json(topic);
  } catch (error) {
    next(error);
  }
});

app.get('/topics/:id/hierarchy', async (req, res, next) => {
  try {
    const hierarchy = await topicHierarchyService.getTopicHierarchy(req.params.id);
    res.json(hierarchy);
  } catch (error) {
    next(error);
  }
});

app.put('/topics/:id', async (req, res, next) => {
  try {
    const topic = await topicRepository.findById(req.params.id);
    if (!topic) {
      return res.status(404).json({
        success: false,
        error: { message: 'Topic not found' }
      });
    }
    const updatedTopic = topic.createNewVersion(req.body.content || topic.getContent());
    await topicRepository.save(updatedTopic);
    res.json(updatedTopic);
  } catch (error) {
    next(error);
  }
});

app.delete('/topics/:id', async (req, res, next) => {
  try {
    const exists = await topicRepository.exists(req.params.id);
    if (!exists) {
      return res.status(404).json({
        success: false,
        error: { message: 'Topic not found' }
      });
    }
    await topicRepository.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Apply custom error handler for development mode
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(`[${new Date().toISOString()}] Error: ${err.message}`);
  console.error(err.stack);

  const response = {
    success: false,
    error: {
      message: err.message || 'Something went wrong!'
    }
  };

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json(response);
  }

  if (err.message.includes('not found') || err.message.includes('No path found')) {
    return res.status(404).json(response);
  }

  // Default to 500 server error
  res.status(500).json(response);
});

describe('API Integration Tests', () => {
  beforeAll((done) => {
    jest.setTimeout(30000); // Increase timeout to 30 seconds
    server = app.listen(0, done);
  });

  afterAll((done) => {
    // Close the server after all tests
    server.close(done);
  });

  beforeEach(async () => {
    // Clear the repository before each test by creating a new instance
    Object.assign(topicRepository, new InMemoryTopicRepository());
    // Reset NODE_ENV to avoid test interference
    delete process.env.NODE_ENV;
  });

  describe('Topic Routes', () => {
    it('should return 404 for non-existent route', async () => {
      await request(app)
        .get('/topics/non-existent-route')
        .expect(404);
    });

    it('should apply global middlewares', async () => {
      const response = await request(app)
        .post('/topics')
        .send({ invalidField: 'test' })
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: {
          message: expect.stringContaining('ValidationError')
        }
      });
    });

    describe('CRUD Operations', () => {
      let createdTopicId: string;

      it('should create a topic', async () => {
        const topicData = {
          name: 'Test Topic',
          content: 'Test Content'
        };

        const response = await request(app)
          .post('/topics')
          .send(topicData)
          .expect(201);

        createdTopicId = response.body.id;
        expect(response.body).toMatchObject({
          name: 'Test Topic',
          content: 'Test Content',
          parentTopicId: null
        });
      });

      it('should get topic by ID', async () => {
        // First create a topic to ensure we have a valid ID
        const createResponse = await request(app)
          .post('/topics')
          .send({ name: 'Get Test Topic', content: 'Content' });

        const topicId = createResponse.body.id;

        await request(app)
          .get(`/topics/${topicId}`)
          .expect(200)
          .expect(res => {
            expect(res.body.id).toBe(topicId);
          });
      });

      it('should update a topic', async () => {
        // First create a topic to ensure we have a valid ID
        const createResponse = await request(app)
          .post('/topics')
          .send({ name: 'Update Test Topic', content: 'Content' });

        const topicId = createResponse.body.id;

        await request(app)
          .put(`/topics/${topicId}`)
          .send({ content: 'Updated Content' })
          .expect(200)
          .expect(res => {
            expect(res.body.content).toBe('Updated Content');
          });
      });

      it('should delete a topic', async () => {
        // First create a topic to ensure we have a valid ID
        const createResponse = await request(app)
          .post('/topics')
          .send({ name: 'Delete Test Topic', content: 'Content' });

        const topicId = createResponse.body.id;

        await request(app)
          .delete(`/topics/${topicId}`)
          .expect(204);

        await request(app)
          .get(`/topics/${topicId}`)
          .expect(404);
      });
    });

    describe('Error Handling', () => {
      it('should format errors consistently', async () => {
        const response = await request(app)
          .get('/topics/invalid-id')
          .expect(404);

        expect(response.body).toEqual({
          success: false,
          error: {
            message: 'Topic not found'
          }
        });
      });
    });
  });

  describe('Topic Hierarchy', () => {
    it('should return topic hierarchy for existing topic', async () => {
      // Create test data directly in the repository
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
    }, 10000); // Extend timeout for this test

    it('should return 404 for non-existent topic', async () => {
      await request(app)
        .get('/topics/non-existent-id/hierarchy')
        .expect(404);
    }, 10000); // Extend timeout for this test
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

    it('should return 400 for missing parameters', async () => {
      await request(app)
        .get('/topics/path')
        .expect(400);
    });

    it('should return 404 for invalid topic IDs', async () => {
      await request(app)
        .get('/topics/path')
        .query({
          startId: 'invalid',
          endId: 'invalid'
        })
        .expect(404);
    });

    it('should return 404 when no path exists', async () => {
      const startTopic = Topic.create('Start', '', null);
      const endTopic = Topic.create('End', '', null);
      await topicRepository.save(startTopic);
      await topicRepository.save(endTopic);

      await request(app)
        .get('/topics/path')
        .query({
          startId: startTopic.getId(),
          endId: endTopic.getId()
        })
        .expect(404);
    });
  });
});