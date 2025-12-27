import axios, { AxiosInstance, AxiosError } from 'axios';
import { cache } from './cache';

const GITHUB_API_BASE = 'https://api.github.com';

interface GitHubRepository {
    id: number;
    name: string;
    full_name: string;
    description: string | null;
    html_url: string;
    stargazers_count: number;
    forks_count: number;
    open_issues_count: number;
    language: string | null;
    topics: string[];
    updated_at: string;
    owner: {
        login: string;
        avatar_url: string;
    };
}

interface GitHubIssue {
    id: number;
    number: number;
    title: string;
    html_url: string;
    labels: Array<{
        id: number;
        name: string;
        color: string;
    }>;
    created_at: string;
    updated_at: string;
    repository_url: string;
    user: {
        login: string;
        avatar_url: string;
    };
}

interface SearchRepositoriesParams {
    language?: string;
    topics?: string[];
    minStars?: number;
    maxStars?: number;
    sort?: 'stars' | 'updated' | 'forks';
    perPage?: number;
    page?: number;
}

interface SearchIssuesParams {
    labels?: string[];
    language?: string;
    state?: 'open' | 'closed' | 'all';
    sort?: 'created' | 'updated' | 'comments';
    perPage?: number;
    page?: number;
}

interface RateLimit {
    limit: number;
    remaining: number;
    reset: number;
}

class GitHubService {
    private api: AxiosInstance;
    private token: string | null = null;

    constructor() {
        this.api = axios.create({
            baseURL: GITHUB_API_BASE,
            headers: {
                'Accept': 'application/vnd.github.v3+json',
            },
        });

        // Add response interceptor for rate limiting
        this.api.interceptors.response.use(
            response => response,
            this.handleError.bind(this)
        );
    }

    setToken(token: string) {
        this.token = token;
        this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    private async handleError(error: AxiosError) {
        if (error.response?.status === 403) {
            // Rate limit exceeded
            const resetTime = error.response.headers['x-ratelimit-reset'];
            if (resetTime) {
                const waitTime = parseInt(resetTime) * 1000 - Date.now();
                console.warn(`Rate limit exceeded. Resets in ${Math.ceil(waitTime / 1000)}s`);
            }
        } else if (error.response?.status === 401) {
            console.error('GitHub authentication failed');
        }
        throw error;
    }

    async getRateLimit(): Promise<RateLimit> {
        const cacheKey = 'rate-limit';
        const cached = cache.get<RateLimit>(cacheKey);
        if (cached) return cached;

        try {
            const response = await this.api.get('/rate_limit');
            const rateLimit = response.data.rate;
            cache.set(cacheKey, rateLimit, 1); // Cache for 1 minute
            return rateLimit;
        } catch (error) {
            console.error('Failed to fetch rate limit:', error);
            return { limit: 60, remaining: 60, reset: Date.now() / 1000 + 3600 };
        }
    }

    async searchRepositories(params: SearchRepositoriesParams = {}): Promise<GitHubRepository[]> {
        const {
            language,
            topics = [],
            minStars = 100,
            maxStars,
            sort = 'stars',
            perPage = 20,
            page = 1,
        } = params;

        // Build search query
        const queryParts: string[] = [];

        if (language) {
            queryParts.push(`language:${language}`);
        }

        topics.forEach(topic => {
            queryParts.push(`topic:${topic}`);
        });

        queryParts.push(`stars:${minStars}..${maxStars || '*'}`);
        queryParts.push('is:public');
        queryParts.push('archived:false');

        const query = queryParts.join(' ');
        const cacheKey = `repos-${query}-${sort}-${page}`;

        // Check cache
        const cached = cache.get<GitHubRepository[]>(cacheKey);
        if (cached) return cached;

        try {
            const response = await this.api.get('/search/repositories', {
                params: {
                    q: query,
                    sort,
                    order: 'desc',
                    per_page: perPage,
                    page,
                },
            });

            const repos = response.data.items;
            cache.set(cacheKey, repos, 60); // Cache for 1 hour
            return repos;
        } catch (error) {
            console.error('Failed to search repositories:', error);
            return [];
        }
    }

    async searchIssues(params: SearchIssuesParams = {}): Promise<GitHubIssue[]> {
        const {
            labels = ['good first issue'],
            language,
            state = 'open',
            sort = 'created',
            perPage = 30,
            page = 1,
        } = params;

        // Build search query
        const queryParts: string[] = [];

        queryParts.push(`state:${state}`);
        queryParts.push('is:issue');
        queryParts.push('is:public');

        if (language) {
            queryParts.push(`language:${language}`);
        }

        labels.forEach(label => {
            queryParts.push(`label:"${label}"`);
        });

        const query = queryParts.join(' ');
        const cacheKey = `issues-${query}-${sort}-${page}`;

        // Check cache
        const cached = cache.get<GitHubIssue[]>(cacheKey);
        if (cached) return cached;

        try {
            const response = await this.api.get('/search/issues', {
                params: {
                    q: query,
                    sort,
                    order: 'desc',
                    per_page: perPage,
                    page,
                },
            });

            const issues = response.data.items;
            cache.set(cacheKey, issues, 15); // Cache for 15 minutes
            return issues;
        } catch (error) {
            console.error('Failed to search issues:', error);
            return [];
        }
    }

    async getRepository(owner: string, repo: string): Promise<GitHubRepository | null> {
        const cacheKey = `repo-${owner}-${repo}`;
        const cached = cache.get<GitHubRepository>(cacheKey);
        if (cached) return cached;

        try {
            const response = await this.api.get(`/repos/${owner}/${repo}`);
            const repository = response.data;
            cache.set(cacheKey, repository, 360); // Cache for 6 hours
            return repository;
        } catch (error) {
            console.error(`Failed to fetch repository ${owner}/${repo}:`, error);
            return null;
        }
    }

    async getRepositoryById(id: number): Promise<GitHubRepository | null> {
        const cacheKey = `repo-id-${id}`;
        const cached = cache.get<GitHubRepository>(cacheKey);
        if (cached) return cached;

        try {
            const response = await this.api.get(`/repositories/${id}`);
            const repository = response.data;
            cache.set(cacheKey, repository, 360); // Cache for 6 hours
            return repository;
        } catch (error) {
            console.error(`Failed to fetch repository ${id}:`, error);
            return null;
        }
    }

    async getRepositoryIssues(
        owner: string,
        repo: string,
        labels?: string[]
    ): Promise<GitHubIssue[]> {
        const labelParam = labels?.join(',') || '';
        const cacheKey = `repo-issues-${owner}-${repo}-${labelParam}`;
        const cached = cache.get<GitHubIssue[]>(cacheKey);
        if (cached) return cached;

        try {
            const response = await this.api.get(`/repos/${owner}/${repo}/issues`, {
                params: {
                    state: 'open',
                    labels: labelParam,
                    per_page: 30,
                },
            });

            const issues = response.data;
            cache.set(cacheKey, issues, 15); // Cache for 15 minutes
            return issues;
        } catch (error) {
            console.error(`Failed to fetch issues for ${owner}/${repo}:`, error);
            return [];
        }
    }

    clearCache() {
        cache.clear();
    }
}

export const githubService = new GitHubService();
export type { GitHubRepository, GitHubIssue, SearchRepositoriesParams, SearchIssuesParams, RateLimit };
