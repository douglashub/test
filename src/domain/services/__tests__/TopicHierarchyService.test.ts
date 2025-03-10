import { TopicHierarchyService } from '../TopicHierarchyService';
import { Topic } from '../../entities/Topic';
import { TopicRepository } from '../../repositories/TopicRepository';

describe('TopicHierarchyService', () => {
  let topicRepository: jest.Mocked<TopicRepository>;
  let service: TopicHierarchyService;

  beforeEach(() => {
    topicRepository = {
      findById: jest.fn(),
      findByParentId: jest.fn(),
      save: jest.fn(),
      findByIdAndVersion: jest.fn(),
      findAll: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
      findAllVersions: jest.fn()
    } as jest.Mocked<TopicRepository>;

    service = new TopicHierarchyService(topicRepository);
  });

  describe('getTopicHierarchy', () => {
    it('should build topic hierarchy correctly', async () => {
      const rootTopic = Topic.create('Root', '', null);
      const childTopic1 = Topic.create('Child 1', '', rootTopic.getId());
      const childTopic2 = Topic.create('Child 2', '', rootTopic.getId());
      const grandchildTopic = Topic.create('Grandchild', '', childTopic1.getId());

      topicRepository.findById.mockResolvedValue(rootTopic);
      topicRepository.findByParentId.mockImplementation(async (parentId) => {
        if (parentId === rootTopic.getId()) return [childTopic1, childTopic2];
        if (parentId === childTopic1.getId()) return [grandchildTopic];
        return [];
      });

      const hierarchy = await service.getTopicHierarchy(rootTopic.getId());

      expect(hierarchy).toEqual({
        id: rootTopic.getId(),
        name: rootTopic.getName(),
        version: rootTopic.getVersion(),
        children: [
          {
            id: childTopic1.getId(),
            name: childTopic1.getName(),
            version: childTopic1.getVersion(),
            children: [
              {
                id: grandchildTopic.getId(),
                name: grandchildTopic.getName(),
                version: grandchildTopic.getVersion(),
                children: []
              }
            ]
          },
          {
            id: childTopic2.getId(),
            name: childTopic2.getName(),
            version: childTopic2.getVersion(),
            children: []
          }
        ]
      });
    });

    it('should throw error when root topic not found', async () => {
      topicRepository.findById.mockResolvedValue(null);

      await expect(service.getTopicHierarchy('non-existent-id'))
        .rejects
        .toThrow('Topic with id non-existent-id not found');
    });
  });

  describe('findShortestPath', () => {
    it('should find shortest path between two topics', async () => {
      const rootTopic = Topic.create('Root', '', null);
      const childTopic = Topic.create('Child', '', rootTopic.getId());
      const targetTopic = Topic.create('Target', '', childTopic.getId());

      topicRepository.findById
        .mockImplementation(async (id) => {
          if (id === rootTopic.getId()) return rootTopic;
          if (id === childTopic.getId()) return childTopic;
          if (id === targetTopic.getId()) return targetTopic;
          return null;
        });

      topicRepository.findByParentId
        .mockImplementation(async (parentId) => {
          if (parentId === rootTopic.getId()) return [childTopic];
          if (parentId === childTopic.getId()) return [targetTopic];
          return [];
        });

      const path = await service.findShortestPath(
        rootTopic.getId(),
        targetTopic.getId()
      );

      expect(path).toEqual([
        rootTopic.getId(),
        childTopic.getId(),
        targetTopic.getId()
      ]);
    });

    it('should throw error when no path exists', async () => {
      const startTopic = Topic.create('Start', '', null);
      const endTopic = Topic.create('End', '', null);

      topicRepository.findById
        .mockImplementation(async (id) => {
          if (id === startTopic.getId()) return startTopic;
          if (id === endTopic.getId()) return endTopic;
          return null;
        });

      topicRepository.findByParentId.mockResolvedValue([]);

      await expect(service.findShortestPath(
        startTopic.getId(),
        endTopic.getId()
      ))
        .rejects
        .toThrow(`No path found between topics ${startTopic.getId()} and ${endTopic.getId()}`);
    });
  });
});

