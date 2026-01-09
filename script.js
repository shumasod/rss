// RSSフィード管理クラス
class RSSFeedReader {
    constructor() {
        this.feeds = this.loadFeeds();
        this.articles = [];
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderRegisteredFeeds();
        this.loadAllFeeds();
    }

    setupEventListeners() {
        // フィード追加ボタン
        document.getElementById('addFeedBtn').addEventListener('click', () => {
            const url = document.getElementById('feedUrl').value.trim();
            if (url) {
                this.addFeed(url);
                document.getElementById('feedUrl').value = '';
            }
        });

        // Enterキーでフィード追加
        document.getElementById('feedUrl').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const url = e.target.value.trim();
                if (url) {
                    this.addFeed(url);
                    e.target.value = '';
                }
            }
        });

        // プリセットフィードボタン
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const url = btn.dataset.url;
                this.addFeed(url);
            });
        });

        // フィルターボタン
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentFilter = btn.dataset.filter;
                this.renderArticles();
            });
        });
    }

    loadFeeds() {
        const saved = localStorage.getItem('rssFeeds');
        return saved ? JSON.parse(saved) : [];
    }

    saveFeeds() {
        localStorage.setItem('rssFeeds', JSON.stringify(this.feeds));
    }

    addFeed(url) {
        // 既に登録されているかチェック
        if (this.feeds.some(feed => feed.url === url)) {
            alert('このフィードは既に登録されています');
            return;
        }

        this.feeds.push({ url, name: url });
        this.saveFeeds();
        this.renderRegisteredFeeds();
        this.loadFeed(url);
    }

    removeFeed(url) {
        this.feeds = this.feeds.filter(feed => feed.url !== url);
        this.articles = this.articles.filter(article => article.feedUrl !== url);
        this.saveFeeds();
        this.renderRegisteredFeeds();
        this.renderArticles();
    }

    renderRegisteredFeeds() {
        const container = document.getElementById('registeredFeeds');

        if (this.feeds.length === 0) {
            container.innerHTML = '<p style="color: #999;">登録されているフィードはありません</p>';
            return;
        }

        container.innerHTML = this.feeds.map(feed => `
            <div class="feed-item">
                <div>
                    <div class="feed-name">${this.escapeHtml(feed.name)}</div>
                    <div class="feed-url">${this.escapeHtml(feed.url)}</div>
                </div>
                <button class="remove-feed-btn" onclick="feedReader.removeFeed('${this.escapeHtml(feed.url)}')">
                    削除
                </button>
            </div>
        `).join('');
    }

    async loadAllFeeds() {
        if (this.feeds.length === 0) {
            this.renderEmptyState();
            return;
        }

        this.showLoading();
        this.articles = [];

        for (const feed of this.feeds) {
            await this.loadFeed(feed.url);
        }

        this.hideLoading();
        this.renderArticles();
    }

    async loadFeed(url) {
        try {
            // CORS対策のためRSS2JSON APIを使用
            const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`;
            const response = await fetch(apiUrl);
            const data = await response.json();

            if (data.status === 'ok') {
                // フィード名を更新
                const feedIndex = this.feeds.findIndex(f => f.url === url);
                if (feedIndex !== -1 && data.feed && data.feed.title) {
                    this.feeds[feedIndex].name = data.feed.title;
                    this.saveFeeds();
                    this.renderRegisteredFeeds();
                }

                // 記事を追加
                const articles = data.items.map(item => ({
                    title: item.title,
                    description: item.description,
                    link: item.link,
                    pubDate: new Date(item.pubDate),
                    source: data.feed.title || url,
                    feedUrl: url
                }));

                this.articles = [...this.articles, ...articles];
                this.articles.sort((a, b) => b.pubDate - a.pubDate);
            }
        } catch (error) {
            console.error(`フィードの読み込みに失敗: ${url}`, error);
        }
    }

    showLoading() {
        document.getElementById('loadingIndicator').style.display = 'block';
        document.getElementById('feedContainer').style.display = 'none';
    }

    hideLoading() {
        document.getElementById('loadingIndicator').style.display = 'none';
        document.getElementById('feedContainer').style.display = 'grid';
    }

    renderArticles() {
        const container = document.getElementById('feedContainer');
        const filteredArticles = this.filterArticles();

        if (filteredArticles.length === 0) {
            this.renderEmptyState();
            return;
        }

        container.innerHTML = filteredArticles.map(article => `
            <div class="article-card" onclick="window.open('${this.escapeHtml(article.link)}', '_blank')">
                <span class="article-source">${this.escapeHtml(article.source)}</span>
                <h3 class="article-title">${this.escapeHtml(article.title)}</h3>
                <p class="article-description">${this.stripHtml(article.description)}</p>
                <div class="article-meta">
                    <span class="article-date">${this.formatDate(article.pubDate)}</span>
                    <a href="${this.escapeHtml(article.link)}" class="article-link" onclick="event.stopPropagation()">
                        記事を読む →
                    </a>
                </div>
            </div>
        `).join('');
    }

    filterArticles() {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

        switch (this.currentFilter) {
            case 'today':
                return this.articles.filter(article => article.pubDate >= today);
            case 'week':
                return this.articles.filter(article => article.pubDate >= weekAgo);
            default:
                return this.articles;
        }
    }

    renderEmptyState() {
        const container = document.getElementById('feedContainer');
        container.innerHTML = `
            <div class="empty-state">
                <h3>📭 記事がありません</h3>
                <p>RSSフィードを追加して最新情報をチェックしましょう</p>
            </div>
        `;
    }

    formatDate(date) {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 60) {
            return `${minutes}分前`;
        } else if (hours < 24) {
            return `${hours}時間前`;
        } else if (days < 7) {
            return `${days}日前`;
        } else {
            return date.toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    }

    stripHtml(html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        const text = tmp.textContent || tmp.innerText || '';
        return text.substring(0, 200) + (text.length > 200 ? '...' : '');
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
}

// アプリケーション起動
let feedReader;
document.addEventListener('DOMContentLoaded', () => {
    feedReader = new RSSFeedReader();
});
