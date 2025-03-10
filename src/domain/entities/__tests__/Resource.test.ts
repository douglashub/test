import { Resource, ResourceType } from '../Resource';

describe('Resource', () => {
  describe('create', () => {
    it('should create a new resource with valid parameters', () => {
      const topicId = 'topic-123';
      const url = 'https://example.com';
      const description = 'Test resource';
      const type = ResourceType.ARTICLE;

      const resource = Resource.create(topicId, url, description, type);

      expect(resource.getId()).toBeDefined();
      expect(resource.getTopicId()).toBe(topicId);
      expect(resource.getUrl()).toBe(url);
      expect(resource.getDescription()).toBe(description);
      expect(resource.getType()).toBe(type);
      expect(resource.getCreatedAt()).toBeInstanceOf(Date);
      expect(resource.getUpdatedAt()).toBeInstanceOf(Date);
      expect(resource.getCreatedAt()).toEqual(resource.getUpdatedAt());
    });
  });

  describe('updateDescription', () => {
    it('should update description and updatedAt timestamp', () => {
      const resource = Resource.create(
        'topic-123',
        'https://example.com',
        'Initial description',
        ResourceType.VIDEO
      );

      const initialUpdatedAt = resource.getUpdatedAt();
      const newDescription = 'Updated description';

      jest.useFakeTimers();
      //jest.advanceTimersByTime(1000);

      resource.updateDescription(newDescription);

      expect(resource.getDescription()).toBe(newDescription);
      expect(resource.getUpdatedAt().getTime()).toBeGreaterThan(
        initialUpdatedAt.getTime()
      );
    });
  });
});