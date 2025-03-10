// src/domain/entities/__tests__/Topic.test.ts

import { Topic } from "../../domain/entities/Topic";


describe('Topic', () => {
  describe('create', () => {
    it('should create a new topic with valid parameters', () => {
      const name = 'Test Topic';
      const content = 'Test content';
      const parentTopicId = 'parent-123';

      const topic = Topic.create(name, content, parentTopicId);

      expect(topic.getId()).toBeDefined();
      expect(topic.getName()).toBe(name);
      expect(topic.getContent()).toBe(content);
      expect(topic.getParentTopicId()).toBe(parentTopicId);
      expect(topic.getVersion()).toBe(1);
      expect(topic.getCreatedAt()).toBeInstanceOf(Date);
      expect(topic.getUpdatedAt()).toBeInstanceOf(Date);
      expect(topic.getChildTopics()).toEqual([]);
    });

    it('should create a root topic when parentTopicId is null', () => {
      const topic = Topic.create('Root Topic', 'Root content');

      expect(topic.getParentTopicId()).toBeNull();
    });
  });

  describe('createNewVersion', () => {
    it('should create a new version of the topic with updated content', () => {
      const originalTopic = Topic.create('Original', 'Original content');
      const newContent = 'Updated content';

      // Add a small delay to ensure the timestamps are different
      jest.useFakeTimers();
      jest.setSystemTime(Date.now() + 1000); // Advance time by 1 second

      const newVersionTopic = originalTopic.createNewVersion(newContent);

      expect(newVersionTopic.getId()).toBe(originalTopic.getId());
      expect(newVersionTopic.getName()).toBe(originalTopic.getName());
      expect(newVersionTopic.getContent()).toBe(newContent);
      expect(newVersionTopic.getVersion()).toBe(originalTopic.getVersion() + 1);
      expect(newVersionTopic.getCreatedAt()).toEqual(originalTopic.getCreatedAt());
      expect(newVersionTopic.getUpdatedAt().getTime()).toBeGreaterThan(originalTopic.getUpdatedAt().getTime());
      
      jest.useRealTimers(); // Restore real timers
    });
  });

  describe('child topic management', () => {
    it('should add a child topic', () => {
      const parentTopic = Topic.create('Parent', 'Parent content');
      const childTopicId = 'child-123';

      parentTopic.addChildTopic(childTopicId);

      expect(parentTopic.getChildTopics()).toContain(childTopicId);
      expect(parentTopic.hasChild(childTopicId)).toBe(true);
    });

    it('should remove a child topic', () => {
      const parentTopic = Topic.create('Parent', 'Parent content');
      const childTopicId = 'child-123';
      
      parentTopic.addChildTopic(childTopicId);
      expect(parentTopic.hasChild(childTopicId)).toBe(true);
      
      parentTopic.removeChildTopic(childTopicId);
      
      expect(parentTopic.getChildTopics()).not.toContain(childTopicId);
      expect(parentTopic.hasChild(childTopicId)).toBe(false);
    });

    it('should not affect the topic when removing a non-existent child', () => {
      const parentTopic = Topic.create('Parent', 'Parent content');
      const childTopicId = 'child-123';
      const nonExistentChildId = 'non-existent-child';
      
      parentTopic.addChildTopic(childTopicId);
      const childrenBeforeRemove = [...parentTopic.getChildTopics()];
      
      parentTopic.removeChildTopic(nonExistentChildId);
      
      expect(parentTopic.getChildTopics()).toEqual(childrenBeforeRemove);
    });
  });
});