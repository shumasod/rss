import { describe, it, expect, beforeEach } from 'vitest'
import { Feed } from '../Feed'

describe('Feed', () => {
  describe('create', () => {
    it('should create a new Feed with URL only', () => {
      const url = 'https://example.com/rss.xml'
      const feed = Feed.create(url)

      expect(feed.url.value).toBe(url)
      expect(feed.name.value).toBe(url) // Name defaults to URL when not provided
      expect(feed.isActive).toBe(true)
      expect(feed.id).toBeDefined()
      expect(feed.createdAt).toBeInstanceOf(Date)
    })

    it('should create a new Feed with URL and name', () => {
      const url = 'https://example.com/rss.xml'
      const name = 'Tech News'
      const feed = Feed.create(url, name)

      expect(feed.url.value).toBe(url)
      expect(feed.name.value).toBe(name)
      expect(feed.isActive).toBe(true)
    })

    it('should throw an error for invalid URL', () => {
      expect(() => Feed.create('invalid-url')).toThrow('Invalid Feed URL format')
    })

    it('should throw an error for empty URL', () => {
      expect(() => Feed.create('')).toThrow('Feed URL cannot be empty')
    })

    it('should generate unique IDs for each Feed', () => {
      const feed1 = Feed.create('https://example.com/rss1.xml')
      const feed2 = Feed.create('https://example.com/rss2.xml')

      expect(feed1.id.value).not.toBe(feed2.id.value)
    })
  })

  describe('reconstruct', () => {
    it('should reconstruct a Feed from stored data', () => {
      const id = '123e4567-e89b-12d3-a456-426614174000'
      const url = 'https://example.com/rss.xml'
      const name = 'Tech News'
      const isActive = false
      const createdAt = new Date('2024-01-01T00:00:00Z')

      const feed = Feed.reconstruct(id, url, name, isActive, createdAt)

      expect(feed.id.value).toBe(id)
      expect(feed.url.value).toBe(url)
      expect(feed.name.value).toBe(name)
      expect(feed.isActive).toBe(isActive)
      expect(feed.createdAt).toEqual(createdAt)
    })

    it('should throw an error for invalid data during reconstruction', () => {
      expect(() =>
        Feed.reconstruct('123', 'invalid-url', 'Test', true, new Date())
      ).toThrow('Invalid Feed URL format')
    })
  })

  describe('updateName', () => {
    it('should update the feed name', () => {
      const feed = Feed.create('https://example.com/rss.xml', 'Old Name')

      feed.updateName('New Name')

      expect(feed.name.value).toBe('New Name')
    })

    it('should throw an error for invalid name', () => {
      const feed = Feed.create('https://example.com/rss.xml', 'Valid Name')

      expect(() => feed.updateName('')).toThrow('Feed name cannot be empty')
    })
  })

  describe('activate/deactivate', () => {
    it('should deactivate a feed', () => {
      const feed = Feed.create('https://example.com/rss.xml')
      expect(feed.isActive).toBe(true)

      feed.deactivate()

      expect(feed.isActive).toBe(false)
    })

    it('should activate a feed', () => {
      const feed = Feed.reconstruct(
        '123',
        'https://example.com/rss.xml',
        'Test',
        false,
        new Date()
      )
      expect(feed.isActive).toBe(false)

      feed.activate()

      expect(feed.isActive).toBe(true)
    })
  })

  describe('equals', () => {
    it('should return true for feeds with the same ID', () => {
      const id = '123e4567-e89b-12d3-a456-426614174000'
      const feed1 = Feed.reconstruct(
        id,
        'https://example.com/rss1.xml',
        'Feed 1',
        true,
        new Date()
      )
      const feed2 = Feed.reconstruct(
        id,
        'https://example.com/rss2.xml',
        'Feed 2',
        false,
        new Date()
      )

      expect(feed1.equals(feed2)).toBe(true)
    })

    it('should return false for feeds with different IDs', () => {
      const feed1 = Feed.create('https://example.com/rss1.xml')
      const feed2 = Feed.create('https://example.com/rss2.xml')

      expect(feed1.equals(feed2)).toBe(false)
    })
  })

  describe('toJSON', () => {
    it('should return a JSON representation of the feed', () => {
      const id = '123e4567-e89b-12d3-a456-426614174000'
      const url = 'https://example.com/rss.xml'
      const name = 'Tech News'
      const isActive = true
      const createdAt = new Date('2024-01-01T00:00:00Z')

      const feed = Feed.reconstruct(id, url, name, isActive, createdAt)
      const json = feed.toJSON()

      expect(json).toEqual({
        id,
        name,
        url,
        isActive,
        createdAt: '2024-01-01T00:00:00.000Z',
      })
    })
  })
})
