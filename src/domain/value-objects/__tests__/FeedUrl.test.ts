import { describe, it, expect } from 'vitest'
import { FeedUrl } from '../FeedUrl'

describe('FeedUrl', () => {
  describe('constructor', () => {
    it('should create a valid FeedUrl with a valid URL', () => {
      const url = 'https://example.com/rss.xml'
      const feedUrl = new FeedUrl(url)

      expect(feedUrl.value).toBe(url)
    })

    it('should accept HTTP URLs', () => {
      const url = 'http://example.com/feed.xml'
      const feedUrl = new FeedUrl(url)

      expect(feedUrl.value).toBe(url)
    })

    it('should accept URLs with query parameters', () => {
      const url = 'https://example.com/rss?format=xml&limit=10'
      const feedUrl = new FeedUrl(url)

      expect(feedUrl.value).toBe(url)
    })

    it('should throw an error for empty URL', () => {
      expect(() => new FeedUrl('')).toThrow('Feed URL cannot be empty')
    })

    it('should throw an error for whitespace-only URL', () => {
      expect(() => new FeedUrl('   ')).toThrow('Feed URL cannot be empty')
    })

    it('should throw an error for invalid URL format', () => {
      expect(() => new FeedUrl('not-a-valid-url')).toThrow('Invalid Feed URL format')
    })

    it('should throw an error for URL without protocol', () => {
      expect(() => new FeedUrl('example.com/rss.xml')).toThrow('Invalid Feed URL format')
    })
  })

  describe('equals', () => {
    it('should return true for FeedUrls with the same value', () => {
      const url = 'https://example.com/rss.xml'
      const feedUrl1 = new FeedUrl(url)
      const feedUrl2 = new FeedUrl(url)

      expect(feedUrl1.equals(feedUrl2)).toBe(true)
    })

    it('should return false for FeedUrls with different values', () => {
      const feedUrl1 = new FeedUrl('https://example.com/rss1.xml')
      const feedUrl2 = new FeedUrl('https://example.com/rss2.xml')

      expect(feedUrl1.equals(feedUrl2)).toBe(false)
    })
  })

  describe('toString', () => {
    it('should return the URL string', () => {
      const url = 'https://example.com/rss.xml'
      const feedUrl = new FeedUrl(url)

      expect(feedUrl.toString()).toBe(url)
    })
  })
})
