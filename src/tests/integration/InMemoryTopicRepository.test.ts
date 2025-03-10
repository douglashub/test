// src/infrastructure/repositories/__tests__/InMemoryTopicRepository.test.ts

import { Topic } from "../../domain/entities/Topic";
import { InMemoryTopicRepository } from "../../infrastructure/repositories/InMemoryTopicRepository";


describe('InMemoryTopicRepository', () => {
  let repository: InMemoryTopicRepository;

  beforeEach(() => {
    repository = new InMemoryTopicRepository();
  });

  describe('save', () => {
    it('should save a new topic', async () => {
      const topic = Topic.create('Test Topic', 'Test content');
      
      await repository.save(topic);
      
      const retrievedTopic = await repository.findById(topic.getId());
      expect(retrievedTopic).toEqual(topic);
    });

    it('should store versions when saving the same topic multiple times', async () => {
      const topic = Topic.create('Original Topic', 'Original content');
      await repository.save(topic);
      
      const updatedTopic = topic.createNewVersion('Updated content');
      await repository.save(updatedTopic);
      
      const versions = await repository.findAllVersions(topic.getId());
      expect(versions.length).toBe(2);
      expect(versions[0]).toEqual(topic);
      expect(versions[1]).toEqual(updatedTopic);
    });
  });

  describe('findById', () => {
    it('should return the latest version of a topic', async () => {
      const originalTopic = Topic.create('Topic', 'Original content');
      await repository.save(originalTopic);
      
      const updatedTopic = originalTopic.createNewVersion('Updated content');
      await repository.save(updatedTopic);
      
      const retrievedTopic = await repository.findById(originalTopic.getId());
      expect(retrievedTopic).toEqual(updatedTopic);
    });

    it('should return null for non-existent topic', async () => {
      const retrievedTopic = await repository.findById('non-existent-id');
      expect(retrievedTopic).toBeNull();
    });
  });

  describe('findByIdAndVersion', () => {
    it('should return a specific version of a topic', async () => {
      const originalTopic = Topic.create('Topic', 'Original content');
      await repository.save(originalTopic);
      
      const updatedTopic = originalTopic.createNewVersion('Updated content');
      await repository.save(updatedTopic);
      
      const retrievedOriginalTopic = await repository.findByIdAndVersion(originalTopic.getId(), 1);
      expect(retrievedOriginalTopic).toEqual(originalTopic);
      
      const retrievedUpdatedTopic = await repository.findByIdAndVersion(originalTopic.getId(), 2);
      expect(retrievedUpdatedTopic).toEqual(updatedTopic);
    });

    it('should return null for non-existent version', async () => {
      const topic = Topic.create('Topic', 'Content');
      await repository.save(topic);
      
      const retrievedTopic = await repository.findByIdAndVersion(topic.getId(), 999);
      expect(retrievedTopic).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all topics (latest versions)', async () => {
      const topic1 = Topic.create('Topic 1', 'Content 1');
      const topic2 = Topic.create('Topic 2', 'Content 2');
      
      await repository.save(topic1);
      await repository.save(topic2);
      
      const allTopics = await repository.findAll();
      expect(allTopics.length).toBe(2);
      expect(allTopics).toContainEqual(topic1);
      expect(allTopics).toContainEqual(topic2);
    });
  });

  describe('findByParentId', () => {
    it('should return all child topics for a given parent ID', async () => {
      const parentTopic = Topic.create('Parent', 'Parent content');
      const childTopic1 = Topic.create('Child 1', 'Child content 1', parentTopic.getId());
      const childTopic2 = Topic.create('Child 2', 'Child content 2', parentTopic.getId());
      const unrelatedTopic = Topic.create('Unrelated', 'Unrelated content', 'other-parent-id');
      
      await repository.save(parentTopic);
      await repository.save(childTopic1);
      await repository.save(childTopic2);
      await repository.save(unrelatedTopic);
      
      const childTopics = await repository.findByParentId(parentTopic.getId());
      expect(childTopics.length).toBe(2);
      expect(childTopics).toContainEqual(childTopic1);
      expect(childTopics).toContainEqual(childTopic2);
    });

    it('should return root topics when parentId is null', async () => {
      const rootTopic1 = Topic.create('Root 1', 'Root content 1');
      const rootTopic2 = Topic.create('Root 2', 'Root content 2');
      const childTopic = Topic.create('Child', 'Child content', 'some-parent-id');
      
      await repository.save(rootTopic1);
      await repository.save(rootTopic2);
      await repository.save(childTopic);
      
      const rootTopics = await repository.findByParentId(null);
      expect(rootTopics.length).toBe(2);
      expect(rootTopics).toContainEqual(rootTopic1);
      expect(rootTopics).toContainEqual(rootTopic2);
    });
  });

  describe('delete', () => {
    it('should delete a topic and all its versions', async () => {
      const topic = Topic.create('Topic', 'Original content');
      await repository.save(topic);
      
      const updatedTopic = topic.createNewVersion('Updated content');
      await repository.save(updatedTopic);
      
      await repository.delete(topic.getId());
      
      expect(await repository.findById(topic.getId())).toBeNull();
      expect(await repository.findAllVersions(topic.getId())).toEqual([]);
    });
  });

  describe('exists', () => {
    it('should return true for existing topic ID', async () => {
      const topic = Topic.create('Topic', 'Content');
      await repository.save(topic);
      
      expect(await repository.exists(topic.getId())).toBe(true);
    });

    it('should return false for non-existent topic ID', async () => {
      expect(await repository.exists('non-existent-id')).toBe(false);
    });
  });

  describe('clear', () => {
    it('should delete all topics', async () => {
      const topic1 = Topic.create('Topic 1', 'Content 1');
      const topic2 = Topic.create('Topic 2', 'Content 2');
      
      await repository.save(topic1);
      await repository.save(topic2);
      
      await repository.clear();
      
      expect(await repository.findAll()).toEqual([]);
    });
  });
});