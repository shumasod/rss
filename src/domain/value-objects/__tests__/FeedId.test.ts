import { describe, it, expect } from 'vitest'
import { FeedId } from '../FeedId'

describe('FeedId', () => {
  describe('constructor', () => {
    it('should create a valid FeedId with a valid id', () => {
      const id = '123e4567-e89b-12d3-a456-426614174000'
      const feedId = new FeedId(id)

      expect(feedId.value).toBe(id)
    })

    it('should throw an error for empty id', () => {
      expect(() => new FeedId('')).toThrow('FeedId cannot be empty')
    })

    it('should throw an error for whitespace-only id', () => {
      expect(() => new FeedId('   ')).toThrow('FeedId cannot be empty')
    })
  })

  describe('generate', () => {
    it('should generate a new unique FeedId', () => {
      const feedId1 = FeedId.generate()
      const feedId2 = FeedId.generate()

      expect(feedId1.value).toBeDefined()
      expect(feedId2.value).toBeDefined()
      expect(feedId1.value).not.toBe(feedId2.value)
    })

    it('should generate a valid UUID format', () => {
      const feedId = FeedId.generate()
      // UUID format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

      expect(feedId.value).toMatch(uuidRegex)
    })
  })

  describe('equals', () => {
    it('should return true for FeedIds with the same value', () => {
      const id = '123e4567-e89b-12d3-a456-426614174000'
      const feedId1 = new FeedId(id)
      const feedId2 = new FeedId(id)

      expect(feedId1.equals(feedId2)).toBe(true)
    })

    it('should return false for FeedIds with different values', () => {
      const feedId1 = new FeedId('123e4567-e89b-12d3-a456-426614174000')
      const feedId2 = new FeedId('987fcdeb-51a2-3bc4-d567-890123456789')

      expect(feedId1.equals(feedId2)).toBe(false)
    })
  })

  describe('toString', () => {
    it('should return the id string', () => {
      const id = '123e4567-e89b-12d3-a456-426614174000'
      const feedId = new FeedId(id)

      expect(feedId.toString()).toBe(id)
    })
  })
})
