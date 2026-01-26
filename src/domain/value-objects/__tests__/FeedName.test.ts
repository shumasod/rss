import { describe, it, expect } from 'vitest'
import { FeedName } from '../FeedName'

describe('FeedName', () => {
  describe('constructor', () => {
    it('should create a valid FeedName with a valid name', () => {
      const name = 'Tech News RSS'
      const feedName = new FeedName(name)

      expect(feedName.value).toBe(name)
    })

    it('should accept names with special characters', () => {
      const name = 'Yahoo!ニュース - トップ'
      const feedName = new FeedName(name)

      expect(feedName.value).toBe(name)
    })

    it('should throw an error for empty name', () => {
      expect(() => new FeedName('')).toThrow('Feed name cannot be empty')
    })

    it('should throw an error for whitespace-only name', () => {
      expect(() => new FeedName('   ')).toThrow('Feed name cannot be empty')
    })

    it('should throw an error for name exceeding 200 characters', () => {
      const longName = 'a'.repeat(201)
      expect(() => new FeedName(longName)).toThrow('Feed name cannot exceed 200 characters')
    })

    it('should accept name with exactly 200 characters', () => {
      const maxLengthName = 'a'.repeat(200)
      const feedName = new FeedName(maxLengthName)

      expect(feedName.value).toBe(maxLengthName)
    })
  })

  describe('equals', () => {
    it('should return true for FeedNames with the same value', () => {
      const name = 'Tech News'
      const feedName1 = new FeedName(name)
      const feedName2 = new FeedName(name)

      expect(feedName1.equals(feedName2)).toBe(true)
    })

    it('should return false for FeedNames with different values', () => {
      const feedName1 = new FeedName('Tech News')
      const feedName2 = new FeedName('Science News')

      expect(feedName1.equals(feedName2)).toBe(false)
    })
  })

  describe('toString', () => {
    it('should return the name string', () => {
      const name = 'Tech News'
      const feedName = new FeedName(name)

      expect(feedName.toString()).toBe(name)
    })
  })
})
