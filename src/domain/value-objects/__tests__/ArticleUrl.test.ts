import { describe, it, expect } from 'vitest'
import { ArticleUrl } from '../ArticleUrl'

describe('ArticleUrl', () => {
  describe('constructor', () => {
    it('should create a valid ArticleUrl with a valid URL', () => {
      const url = 'https://example.com/article/123'
      const articleUrl = new ArticleUrl(url)

      expect(articleUrl.value).toBe(url)
    })

    it('should accept HTTP URLs', () => {
      const url = 'http://example.com/article/456'
      const articleUrl = new ArticleUrl(url)

      expect(articleUrl.value).toBe(url)
    })

    it('should accept URLs with query parameters', () => {
      const url = 'https://example.com/article?id=123&ref=rss'
      const articleUrl = new ArticleUrl(url)

      expect(articleUrl.value).toBe(url)
    })

    it('should accept URLs with fragments', () => {
      const url = 'https://example.com/article#section-1'
      const articleUrl = new ArticleUrl(url)

      expect(articleUrl.value).toBe(url)
    })

    it('should throw an error for empty URL', () => {
      expect(() => new ArticleUrl('')).toThrow('Article URL cannot be empty')
    })

    it('should throw an error for whitespace-only URL', () => {
      expect(() => new ArticleUrl('   ')).toThrow('Article URL cannot be empty')
    })

    it('should throw an error for invalid URL format', () => {
      expect(() => new ArticleUrl('not-a-valid-url')).toThrow('Invalid Article URL format')
    })

    it('should throw an error for URL without protocol', () => {
      expect(() => new ArticleUrl('example.com/article')).toThrow('Invalid Article URL format')
    })
  })

  describe('equals', () => {
    it('should return true for ArticleUrls with the same value', () => {
      const url = 'https://example.com/article/123'
      const url1 = new ArticleUrl(url)
      const url2 = new ArticleUrl(url)

      expect(url1.equals(url2)).toBe(true)
    })

    it('should return false for ArticleUrls with different values', () => {
      const url1 = new ArticleUrl('https://example.com/article/1')
      const url2 = new ArticleUrl('https://example.com/article/2')

      expect(url1.equals(url2)).toBe(false)
    })
  })

  describe('toString', () => {
    it('should return the URL string', () => {
      const url = 'https://example.com/article/123'
      const articleUrl = new ArticleUrl(url)

      expect(articleUrl.toString()).toBe(url)
    })
  })
})
