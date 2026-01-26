import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AddFeedUseCase } from '../AddFeedUseCase'
import { Feed } from '@domain/entities/Feed'
import { Article } from '@domain/entities/Article'
import type { IFeedRepository } from '@domain/repositories/IFeedRepository'
import type { IArticleRepository } from '@domain/repositories/IArticleRepository'
import type { IFeedFetchService, FeedFetchResult } from '@domain/services/IFeedFetchService'

describe('AddFeedUseCase', () => {
  let useCase: AddFeedUseCase
  let mockFeedRepository: IFeedRepository
  let mockArticleRepository: IArticleRepository
  let mockFeedFetchService: IFeedFetchService

  beforeEach(() => {
    mockFeedRepository = {
      save: vi.fn().mockResolvedValue(undefined),
      findById: vi.fn(),
      findAll: vi.fn(),
      findActiveFeeds: vi.fn(),
      delete: vi.fn(),
      exists: vi.fn(),
    }

    mockArticleRepository = {
      save: vi.fn().mockResolvedValue(undefined),
      saveMany: vi.fn().mockResolvedValue(undefined),
      findById: vi.fn(),
      findAll: vi.fn(),
      findByFeedId: vi.fn(),
      findRecentArticles: vi.fn(),
      findArticlesGroupedByDate: vi.fn(),
      deleteByFeedId: vi.fn(),
      clear: vi.fn(),
    }

    mockFeedFetchService = {
      fetchFeed: vi.fn(),
    }

    useCase = new AddFeedUseCase(
      mockFeedRepository,
      mockArticleRepository,
      mockFeedFetchService
    )
  })

  describe('execute', () => {
    it('should successfully add a feed with articles', async () => {
      const url = 'https://example.com/rss.xml'
      const feedTitle = 'Tech News Feed'
      const mockArticles = [
        Article.create(
          'feed-id',
          'Article 1',
          'https://example.com/article/1',
          'Description 1',
          new Date(),
          feedTitle
        ),
        Article.create(
          'feed-id',
          'Article 2',
          'https://example.com/article/2',
          'Description 2',
          new Date(),
          feedTitle
        ),
      ]

      const fetchResult: FeedFetchResult = {
        success: true,
        feedTitle,
        articles: mockArticles,
      }

      vi.mocked(mockFeedFetchService.fetchFeed).mockResolvedValue(fetchResult)

      const result = await useCase.execute(url)

      expect(result.success).toBe(true)
      expect(result.feed).toBeDefined()
      expect(result.feed?.name.value).toBe(feedTitle)
      expect(result.articlesCount).toBe(2)
      expect(mockFeedRepository.save).toHaveBeenCalledTimes(1)
      expect(mockArticleRepository.saveMany).toHaveBeenCalledWith(mockArticles)
    })

    it('should successfully add a feed without articles', async () => {
      const url = 'https://example.com/rss.xml'
      const feedTitle = 'Empty Feed'

      const fetchResult: FeedFetchResult = {
        success: true,
        feedTitle,
        articles: [],
      }

      vi.mocked(mockFeedFetchService.fetchFeed).mockResolvedValue(fetchResult)

      const result = await useCase.execute(url)

      expect(result.success).toBe(true)
      expect(result.feed).toBeDefined()
      expect(result.articlesCount).toBe(0)
      expect(mockFeedRepository.save).toHaveBeenCalledTimes(1)
      expect(mockArticleRepository.saveMany).not.toHaveBeenCalled()
    })

    it('should use URL as feed name when feedTitle is not provided', async () => {
      const url = 'https://example.com/rss.xml'

      const fetchResult: FeedFetchResult = {
        success: true,
        articles: [],
      }

      vi.mocked(mockFeedFetchService.fetchFeed).mockResolvedValue(fetchResult)

      const result = await useCase.execute(url)

      expect(result.success).toBe(true)
      expect(result.feed?.name.value).toBe(url)
    })

    it('should return error when fetch fails', async () => {
      const url = 'https://example.com/rss.xml'
      const errorMessage = 'Network error'

      const fetchResult: FeedFetchResult = {
        success: false,
        error: errorMessage,
        articles: [],
      }

      vi.mocked(mockFeedFetchService.fetchFeed).mockResolvedValue(fetchResult)

      const result = await useCase.execute(url)

      expect(result.success).toBe(false)
      expect(result.error).toBe(errorMessage)
      expect(mockFeedRepository.save).not.toHaveBeenCalled()
      expect(mockArticleRepository.saveMany).not.toHaveBeenCalled()
    })

    it('should return error for invalid URL', async () => {
      const result = await useCase.execute('invalid-url')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid Feed URL format')
      expect(mockFeedFetchService.fetchFeed).not.toHaveBeenCalled()
    })

    it('should return error for empty URL', async () => {
      const result = await useCase.execute('')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Feed URL cannot be empty')
      expect(mockFeedFetchService.fetchFeed).not.toHaveBeenCalled()
    })

    it('should handle repository save errors', async () => {
      const url = 'https://example.com/rss.xml'

      const fetchResult: FeedFetchResult = {
        success: true,
        feedTitle: 'Test Feed',
        articles: [],
      }

      vi.mocked(mockFeedFetchService.fetchFeed).mockResolvedValue(fetchResult)
      vi.mocked(mockFeedRepository.save).mockRejectedValue(new Error('Storage error'))

      const result = await useCase.execute(url)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Storage error')
    })

    it('should handle fetch service exceptions', async () => {
      const url = 'https://example.com/rss.xml'

      vi.mocked(mockFeedFetchService.fetchFeed).mockRejectedValue(
        new Error('Unexpected error')
      )

      const result = await useCase.execute(url)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Unexpected error')
    })
  })
})
