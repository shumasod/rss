import { describe, it, expect } from 'vitest'
import { ArticleTitle } from '../ArticleTitle'

describe('ArticleTitle', () => {
  describe('constructor', () => {
    it('should create a valid ArticleTitle with a valid title', () => {
      const title = 'Breaking News: Technology Updates'
      const articleTitle = new ArticleTitle(title)

      expect(articleTitle.value).toBe(title)
    })

    it('should accept titles with special characters and Japanese', () => {
      const title = '【速報】新技術発表 - 2024年の展望'
      const articleTitle = new ArticleTitle(title)

      expect(articleTitle.value).toBe(title)
    })

    it('should throw an error for empty title', () => {
      expect(() => new ArticleTitle('')).toThrow('Article title cannot be empty')
    })

    it('should throw an error for whitespace-only title', () => {
      expect(() => new ArticleTitle('   ')).toThrow('Article title cannot be empty')
    })

    it('should throw an error for title exceeding 500 characters', () => {
      const longTitle = 'a'.repeat(501)
      expect(() => new ArticleTitle(longTitle)).toThrow('Article title cannot exceed 500 characters')
    })

    it('should accept title with exactly 500 characters', () => {
      const maxLengthTitle = 'a'.repeat(500)
      const articleTitle = new ArticleTitle(maxLengthTitle)

      expect(articleTitle.value).toBe(maxLengthTitle)
    })
  })

  describe('equals', () => {
    it('should return true for ArticleTitles with the same value', () => {
      const title = 'News Article'
      const title1 = new ArticleTitle(title)
      const title2 = new ArticleTitle(title)

      expect(title1.equals(title2)).toBe(true)
    })

    it('should return false for ArticleTitles with different values', () => {
      const title1 = new ArticleTitle('News Article 1')
      const title2 = new ArticleTitle('News Article 2')

      expect(title1.equals(title2)).toBe(false)
    })
  })

  describe('toString', () => {
    it('should return the title string', () => {
      const title = 'News Article'
      const articleTitle = new ArticleTitle(title)

      expect(articleTitle.toString()).toBe(title)
    })
  })
})
