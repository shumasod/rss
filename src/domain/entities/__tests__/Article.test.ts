import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { Article } from '../Article'

describe('Article', () => {
  describe('create', () => {
    it('should create a new Article with all required fields', () => {
      const feedId = '123e4567-e89b-12d3-a456-426614174000'
      const title = 'Breaking News'
      const url = 'https://example.com/article/123'
      const description = 'This is the article description'
      const publishedAt = new Date('2024-01-15T10:00:00Z')
      const sourceName = 'Tech News'

      const article = Article.create(feedId, title, url, description, publishedAt, sourceName)

      expect(article.feedId.value).toBe(feedId)
      expect(article.title.value).toBe(title)
      expect(article.url.value).toBe(url)
      expect(article.description).toBe(description)
      expect(article.publishedAt).toEqual(publishedAt)
      expect(article.sourceName).toBe(sourceName)
      expect(article.id).toBeDefined()
    })

    it('should throw an error for empty title', () => {
      expect(() =>
        Article.create(
          '123',
          '',
          'https://example.com/article',
          'Description',
          new Date(),
          'Source'
        )
      ).toThrow('Article title cannot be empty')
    })

    it('should throw an error for invalid URL', () => {
      expect(() =>
        Article.create(
          '123',
          'Title',
          'invalid-url',
          'Description',
          new Date(),
          'Source'
        )
      ).toThrow('Invalid Article URL format')
    })
  })

  describe('reconstruct', () => {
    it('should reconstruct an Article from stored data', () => {
      const id = 'article-123'
      const feedId = 'feed-456'
      const title = 'Article Title'
      const url = 'https://example.com/article/123'
      const description = 'Article description'
      const publishedAt = new Date('2024-01-15T10:00:00Z')
      const sourceName = 'News Source'

      const article = Article.reconstruct(
        id,
        feedId,
        title,
        url,
        description,
        publishedAt,
        sourceName
      )

      expect(article.id.value).toBe(id)
      expect(article.feedId.value).toBe(feedId)
      expect(article.title.value).toBe(title)
      expect(article.url.value).toBe(url)
      expect(article.description).toBe(description)
      expect(article.publishedAt).toEqual(publishedAt)
      expect(article.sourceName).toBe(sourceName)
    })
  })

  describe('isPublishedToday', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should return true for articles published today', () => {
      const now = new Date('2024-01-15T15:00:00Z')
      vi.setSystemTime(now)

      const article = Article.create(
        'feed-123',
        'Today Article',
        'https://example.com/article',
        'Description',
        new Date('2024-01-15T08:00:00Z'),
        'Source'
      )

      expect(article.isPublishedToday()).toBe(true)
    })

    it('should return false for articles published yesterday', () => {
      const now = new Date('2024-01-15T15:00:00Z')
      vi.setSystemTime(now)

      const article = Article.create(
        'feed-123',
        'Yesterday Article',
        'https://example.com/article',
        'Description',
        new Date('2024-01-14T20:00:00Z'),
        'Source'
      )

      expect(article.isPublishedToday()).toBe(false)
    })

    it('should return true for articles published at midnight today', () => {
      const now = new Date('2024-01-15T15:00:00Z')
      vi.setSystemTime(now)

      const article = Article.create(
        'feed-123',
        'Midnight Article',
        'https://example.com/article',
        'Description',
        new Date('2024-01-15T00:00:00Z'),
        'Source'
      )

      expect(article.isPublishedToday()).toBe(true)
    })
  })

  describe('isPublishedWithinDays', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should return true for articles within 7 days', () => {
      const now = new Date('2024-01-15T15:00:00Z')
      vi.setSystemTime(now)

      const article = Article.create(
        'feed-123',
        'Recent Article',
        'https://example.com/article',
        'Description',
        new Date('2024-01-10T10:00:00Z'),
        'Source'
      )

      expect(article.isPublishedWithinDays(7)).toBe(true)
    })

    it('should return false for articles older than 7 days', () => {
      const now = new Date('2024-01-15T15:00:00Z')
      vi.setSystemTime(now)

      const article = Article.create(
        'feed-123',
        'Old Article',
        'https://example.com/article',
        'Description',
        new Date('2024-01-01T10:00:00Z'),
        'Source'
      )

      expect(article.isPublishedWithinDays(7)).toBe(false)
    })

    it('should return true for articles exactly on the threshold', () => {
      const now = new Date('2024-01-15T15:00:00Z')
      vi.setSystemTime(now)

      const article = Article.create(
        'feed-123',
        'Threshold Article',
        'https://example.com/article',
        'Description',
        new Date('2024-01-08T15:00:00Z'),
        'Source'
      )

      expect(article.isPublishedWithinDays(7)).toBe(true)
    })
  })

  describe('equals', () => {
    it('should return true for articles with the same ID', () => {
      const id = 'article-123'
      const article1 = Article.reconstruct(
        id,
        'feed-1',
        'Title 1',
        'https://example.com/1',
        'Desc 1',
        new Date(),
        'Source 1'
      )
      const article2 = Article.reconstruct(
        id,
        'feed-2',
        'Title 2',
        'https://example.com/2',
        'Desc 2',
        new Date(),
        'Source 2'
      )

      expect(article1.equals(article2)).toBe(true)
    })

    it('should return false for articles with different IDs', () => {
      const article1 = Article.create(
        'feed-123',
        'Title 1',
        'https://example.com/1',
        'Desc 1',
        new Date(),
        'Source 1'
      )
      const article2 = Article.create(
        'feed-123',
        'Title 2',
        'https://example.com/2',
        'Desc 2',
        new Date(),
        'Source 2'
      )

      expect(article1.equals(article2)).toBe(false)
    })
  })

  describe('toJSON', () => {
    it('should return a JSON representation of the article', () => {
      const id = 'article-123'
      const feedId = 'feed-456'
      const title = 'Article Title'
      const url = 'https://example.com/article/123'
      const description = 'Article description'
      const publishedAt = new Date('2024-01-15T10:00:00Z')
      const sourceName = 'News Source'

      const article = Article.reconstruct(
        id,
        feedId,
        title,
        url,
        description,
        publishedAt,
        sourceName
      )
      const json = article.toJSON()

      expect(json).toEqual({
        id,
        feedId,
        title,
        url,
        description,
        publishedAt: '2024-01-15T10:00:00.000Z',
        sourceName,
      })
    })
  })
})
