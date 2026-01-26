import { describe, it, expect, beforeEach, vi } from 'vitest'
import { LocalStorageFeedRepository } from '../LocalStorageFeedRepository'
import { Feed } from '@domain/entities/Feed'
import { FeedId } from '@domain/value-objects/FeedId'

describe('LocalStorageFeedRepository', () => {
  let repository: LocalStorageFeedRepository

  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    repository = new LocalStorageFeedRepository()
  })

  describe('save', () => {
    it('should save a new feed to localStorage', async () => {
      const feed = Feed.create('https://example.com/rss.xml', 'Test Feed')

      await repository.save(feed)

      const saved = await repository.findById(feed.id)
      expect(saved).not.toBeNull()
      expect(saved?.name.value).toBe('Test Feed')
      expect(saved?.url.value).toBe('https://example.com/rss.xml')
    })

    it('should update an existing feed', async () => {
      const feed = Feed.create('https://example.com/rss.xml', 'Original Name')
      await repository.save(feed)

      feed.updateName('Updated Name')
      await repository.save(feed)

      const allFeeds = await repository.findAll()
      expect(allFeeds.length).toBe(1)
      expect(allFeeds[0].name.value).toBe('Updated Name')
    })

    it('should preserve existing feeds when adding new ones', async () => {
      const feed1 = Feed.create('https://example.com/rss1.xml', 'Feed 1')
      const feed2 = Feed.create('https://example.com/rss2.xml', 'Feed 2')

      await repository.save(feed1)
      await repository.save(feed2)

      const allFeeds = await repository.findAll()
      expect(allFeeds.length).toBe(2)
    })
  })

  describe('findById', () => {
    it('should return a feed by its ID', async () => {
      const feed = Feed.create('https://example.com/rss.xml', 'Test Feed')
      await repository.save(feed)

      const found = await repository.findById(feed.id)

      expect(found).not.toBeNull()
      expect(found?.id.equals(feed.id)).toBe(true)
    })

    it('should return null for non-existent feed', async () => {
      const nonExistentId = new FeedId('non-existent-id')

      const found = await repository.findById(nonExistentId)

      expect(found).toBeNull()
    })
  })

  describe('findAll', () => {
    it('should return all saved feeds', async () => {
      const feed1 = Feed.create('https://example.com/rss1.xml', 'Feed 1')
      const feed2 = Feed.create('https://example.com/rss2.xml', 'Feed 2')
      const feed3 = Feed.create('https://example.com/rss3.xml', 'Feed 3')

      await repository.save(feed1)
      await repository.save(feed2)
      await repository.save(feed3)

      const allFeeds = await repository.findAll()

      expect(allFeeds.length).toBe(3)
    })

    it('should return empty array when no feeds exist', async () => {
      const allFeeds = await repository.findAll()

      expect(allFeeds).toEqual([])
    })

    it('should handle corrupted localStorage data gracefully', async () => {
      localStorage.setItem('rss_feeds', 'invalid-json')

      const allFeeds = await repository.findAll()

      expect(allFeeds).toEqual([])
    })
  })

  describe('findActiveFeeds', () => {
    it('should return only active feeds', async () => {
      const feed1 = Feed.create('https://example.com/rss1.xml', 'Active Feed')
      const feed2 = Feed.create('https://example.com/rss2.xml', 'Inactive Feed')
      feed2.deactivate()

      await repository.save(feed1)
      await repository.save(feed2)

      const activeFeeds = await repository.findActiveFeeds()

      expect(activeFeeds.length).toBe(1)
      expect(activeFeeds[0].name.value).toBe('Active Feed')
    })

    it('should return empty array when all feeds are inactive', async () => {
      const feed = Feed.create('https://example.com/rss.xml', 'Inactive Feed')
      feed.deactivate()
      await repository.save(feed)

      const activeFeeds = await repository.findActiveFeeds()

      expect(activeFeeds.length).toBe(0)
    })
  })

  describe('delete', () => {
    it('should delete a feed by ID', async () => {
      const feed = Feed.create('https://example.com/rss.xml', 'Test Feed')
      await repository.save(feed)

      await repository.delete(feed.id)

      const found = await repository.findById(feed.id)
      expect(found).toBeNull()
    })

    it('should not throw when deleting non-existent feed', async () => {
      const nonExistentId = new FeedId('non-existent-id')

      await expect(repository.delete(nonExistentId)).resolves.not.toThrow()
    })

    it('should only delete the specified feed', async () => {
      const feed1 = Feed.create('https://example.com/rss1.xml', 'Feed 1')
      const feed2 = Feed.create('https://example.com/rss2.xml', 'Feed 2')
      await repository.save(feed1)
      await repository.save(feed2)

      await repository.delete(feed1.id)

      const allFeeds = await repository.findAll()
      expect(allFeeds.length).toBe(1)
      expect(allFeeds[0].id.equals(feed2.id)).toBe(true)
    })
  })

  describe('exists', () => {
    it('should return true for existing feed', async () => {
      const feed = Feed.create('https://example.com/rss.xml', 'Test Feed')
      await repository.save(feed)

      const exists = await repository.exists(feed.id)

      expect(exists).toBe(true)
    })

    it('should return false for non-existent feed', async () => {
      const nonExistentId = new FeedId('non-existent-id')

      const exists = await repository.exists(nonExistentId)

      expect(exists).toBe(false)
    })
  })

  describe('data persistence', () => {
    it('should correctly serialize and deserialize feed data', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000'
      const url = 'https://example.com/rss.xml'
      const name = 'Test Feed'
      const isActive = false
      const createdAt = new Date('2024-01-01T00:00:00Z')

      const feed = Feed.reconstruct(id, url, name, isActive, createdAt)
      await repository.save(feed)

      // Create new repository instance to simulate page reload
      const newRepository = new LocalStorageFeedRepository()
      const loaded = await newRepository.findById(new FeedId(id))

      expect(loaded).not.toBeNull()
      expect(loaded?.id.value).toBe(id)
      expect(loaded?.url.value).toBe(url)
      expect(loaded?.name.value).toBe(name)
      expect(loaded?.isActive).toBe(isActive)
      expect(loaded?.createdAt.toISOString()).toBe(createdAt.toISOString())
    })
  })
})
