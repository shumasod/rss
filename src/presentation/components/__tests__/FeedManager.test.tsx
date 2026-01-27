import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FeedManager } from '../FeedManager'

describe('FeedManager', () => {
  let mockOnAddFeed: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockOnAddFeed = vi.fn()
  })

  describe('rendering', () => {
    it('should render the component with header', () => {
      render(<FeedManager onAddFeed={mockOnAddFeed} loading={false} />)

      expect(screen.getByText(/RSS フィード管理/)).toBeInTheDocument()
    })

    it('should render the URL input field', () => {
      render(<FeedManager onAddFeed={mockOnAddFeed} loading={false} />)

      const input = screen.getByPlaceholderText('RSSフィードのURLを入力')
      expect(input).toBeInTheDocument()
    })

    it('should render the add feed button', () => {
      render(<FeedManager onAddFeed={mockOnAddFeed} loading={false} />)

      expect(screen.getByText('フィード追加')).toBeInTheDocument()
    })

    it('should render preset feed buttons', () => {
      render(<FeedManager onAddFeed={mockOnAddFeed} loading={false} />)

      expect(screen.getByText('Yahoo!ニュース')).toBeInTheDocument()
      expect(screen.getByText('NHKニュース')).toBeInTheDocument()
      expect(screen.getByText('GIGAZINE')).toBeInTheDocument()
    })

    it('should render preset feeds section header', () => {
      render(<FeedManager onAddFeed={mockOnAddFeed} loading={false} />)

      expect(screen.getByText('プリセットフィード')).toBeInTheDocument()
    })
  })

  describe('form submission', () => {
    it('should call onAddFeed with the URL when form is submitted', async () => {
      mockOnAddFeed.mockResolvedValue(true)
      const user = userEvent.setup()

      render(<FeedManager onAddFeed={mockOnAddFeed} loading={false} />)

      const input = screen.getByPlaceholderText('RSSフィードのURLを入力')
      const submitButton = screen.getByText('フィード追加')

      await user.type(input, 'https://example.com/rss.xml')
      await user.click(submitButton)

      expect(mockOnAddFeed).toHaveBeenCalledWith('https://example.com/rss.xml')
    })

    it('should clear the input after successful submission', async () => {
      mockOnAddFeed.mockResolvedValue(true)
      const user = userEvent.setup()

      render(<FeedManager onAddFeed={mockOnAddFeed} loading={false} />)

      const input = screen.getByPlaceholderText('RSSフィードのURLを入力') as HTMLInputElement
      await user.type(input, 'https://example.com/rss.xml')
      await user.click(screen.getByText('フィード追加'))

      await waitFor(() => {
        expect(input.value).toBe('')
      })
    })

    it('should not clear the input when submission fails', async () => {
      mockOnAddFeed.mockResolvedValue(false)
      const user = userEvent.setup()

      render(<FeedManager onAddFeed={mockOnAddFeed} loading={false} />)

      const input = screen.getByPlaceholderText('RSSフィードのURLを入力') as HTMLInputElement
      await user.type(input, 'https://example.com/rss.xml')
      await user.click(screen.getByText('フィード追加'))

      await waitFor(() => {
        expect(input.value).toBe('https://example.com/rss.xml')
      })
    })

    it('should not submit when input is empty', async () => {
      const user = userEvent.setup()

      render(<FeedManager onAddFeed={mockOnAddFeed} loading={false} />)

      await user.click(screen.getByText('フィード追加'))

      expect(mockOnAddFeed).not.toHaveBeenCalled()
    })

    it('should not submit when input is whitespace only', async () => {
      const user = userEvent.setup()

      render(<FeedManager onAddFeed={mockOnAddFeed} loading={false} />)

      const input = screen.getByPlaceholderText('RSSフィードのURLを入力')
      await user.type(input, '   ')
      await user.click(screen.getByText('フィード追加'))

      expect(mockOnAddFeed).not.toHaveBeenCalled()
    })

    it('should trim the URL before submission', async () => {
      mockOnAddFeed.mockResolvedValue(true)
      const user = userEvent.setup()

      render(<FeedManager onAddFeed={mockOnAddFeed} loading={false} />)

      const input = screen.getByPlaceholderText('RSSフィードのURLを入力')
      await user.type(input, '  https://example.com/rss.xml  ')
      await user.click(screen.getByText('フィード追加'))

      expect(mockOnAddFeed).toHaveBeenCalledWith('https://example.com/rss.xml')
    })
  })

  describe('preset feed buttons', () => {
    it('should call onAddFeed with Yahoo News URL when preset is clicked', async () => {
      mockOnAddFeed.mockResolvedValue(true)
      const user = userEvent.setup()

      render(<FeedManager onAddFeed={mockOnAddFeed} loading={false} />)

      await user.click(screen.getByText('Yahoo!ニュース'))

      expect(mockOnAddFeed).toHaveBeenCalledWith(
        'https://news.yahoo.co.jp/rss/topics/top-picks.xml'
      )
    })

    it('should call onAddFeed with NHK News URL when preset is clicked', async () => {
      mockOnAddFeed.mockResolvedValue(true)
      const user = userEvent.setup()

      render(<FeedManager onAddFeed={mockOnAddFeed} loading={false} />)

      await user.click(screen.getByText('NHKニュース'))

      expect(mockOnAddFeed).toHaveBeenCalledWith(
        'https://www3.nhk.or.jp/rss/news/cat0.xml'
      )
    })

    it('should call onAddFeed with GIGAZINE URL when preset is clicked', async () => {
      mockOnAddFeed.mockResolvedValue(true)
      const user = userEvent.setup()

      render(<FeedManager onAddFeed={mockOnAddFeed} loading={false} />)

      await user.click(screen.getByText('GIGAZINE'))

      expect(mockOnAddFeed).toHaveBeenCalledWith(
        'https://gigazine.net/news/rss_2.0/'
      )
    })
  })

  describe('loading state', () => {
    it('should disable the input when loading', () => {
      render(<FeedManager onAddFeed={mockOnAddFeed} loading={true} />)

      const input = screen.getByPlaceholderText('RSSフィードのURLを入力')
      expect(input).toBeDisabled()
    })

    it('should disable the submit button when loading', () => {
      render(<FeedManager onAddFeed={mockOnAddFeed} loading={true} />)

      const submitButton = screen.getByText('フィード追加')
      expect(submitButton).toBeDisabled()
    })

    it('should disable preset buttons when loading', () => {
      render(<FeedManager onAddFeed={mockOnAddFeed} loading={true} />)

      expect(screen.getByText('Yahoo!ニュース')).toBeDisabled()
      expect(screen.getByText('NHKニュース')).toBeDisabled()
      expect(screen.getByText('GIGAZINE')).toBeDisabled()
    })
  })

  describe('button disabled state', () => {
    it('should disable submit button when input is empty', () => {
      render(<FeedManager onAddFeed={mockOnAddFeed} loading={false} />)

      const submitButton = screen.getByText('フィード追加')
      expect(submitButton).toBeDisabled()
    })

    it('should enable submit button when input has text', async () => {
      const user = userEvent.setup()

      render(<FeedManager onAddFeed={mockOnAddFeed} loading={false} />)

      const input = screen.getByPlaceholderText('RSSフィードのURLを入力')
      await user.type(input, 'https://example.com/rss.xml')

      const submitButton = screen.getByText('フィード追加')
      expect(submitButton).not.toBeDisabled()
    })
  })
})
