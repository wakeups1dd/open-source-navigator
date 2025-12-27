import { useState, useEffect, useCallback } from 'react';
import { githubService, type GitHubRepository, type GitHubIssue, type SearchRepositoriesParams, type SearchIssuesParams } from '@/services/github';
import { matchingService, type ScoredRepository, type ScoredIssue } from '@/services/matching';
import { useAuth } from './useAuth';
import { useUserPreferences } from './useUserPreferences';

interface UseGitHubDataResult<T> {
    data: T | null;
    loading: boolean;
    error: Error | null;
    refetch: () => void;
}

export function useRepositories(params?: SearchRepositoriesParams): UseGitHubDataResult<ScoredRepository[]> {
    const [data, setData] = useState<ScoredRepository[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const { preferences } = useUserPreferences();

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const repos = await githubService.searchRepositories(params);
            const scored = repos.map(repo => matchingService.scoreRepository(repo, preferences));
            const sorted = matchingService.sortByScore(scored, 30);
            setData(sorted);
        } catch (err) {
            setError(err as Error);
            setData([]);
        } finally {
            setLoading(false);
        }
    }, [params, preferences]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, refetch: fetchData };
}

export function useIssues(params?: SearchIssuesParams): UseGitHubDataResult<ScoredIssue[]> {
    const [data, setData] = useState<ScoredIssue[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const { preferences } = useUserPreferences();

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const issues = await githubService.searchIssues(params);
            const scored = issues.map(issue => matchingService.scoreIssue(issue, preferences));
            const sorted = matchingService.sortByScore(scored, 25);
            setData(sorted);
        } catch (err) {
            setError(err as Error);
            setData([]);
        } finally {
            setLoading(false);
        }
    }, [params, preferences]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, refetch: fetchData };
}

export function useRecommendations() {
    const { preferences } = useUserPreferences();
    const [repositories, setRepositories] = useState<ScoredRepository[]>([]);
    const [issues, setIssues] = useState<ScoredIssue[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchRecommendations = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            // Fetch repositories based on user's primary language
            const primaryLanguage = preferences.languages[0];
            const repoPromises = preferences.languages.slice(0, 3).map(lang =>
                githubService.searchRepositories({
                    language: lang,
                    minStars: 100,
                    maxStars: 50000,
                    perPage: 20,
                })
            );

            // Fetch issues with good-first-issue label
            const issueLabels = preferences.experienceLevel === 'beginner'
                ? ['good first issue']
                : preferences.experienceLevel === 'intermediate'
                    ? ['help wanted', 'good first issue']
                    : ['help wanted', 'enhancement'];

            const issuePromises = preferences.languages.slice(0, 2).map(lang =>
                githubService.searchIssues({
                    labels: issueLabels,
                    language: lang,
                    perPage: 30,
                })
            );

            const [repoResults, issueResults] = await Promise.all([
                Promise.all(repoPromises),
                Promise.all(issuePromises),
            ]);

            // Flatten and score
            const allRepos = repoResults.flat();
            const allIssues = issueResults.flat();

            const scoredRepos = allRepos.map(repo =>
                matchingService.scoreRepository(repo, preferences)
            );
            const scoredIssues = allIssues.map(issue =>
                matchingService.scoreIssue(issue, preferences)
            );

            // Sort and deduplicate
            const uniqueRepos = Array.from(
                new Map(scoredRepos.map(r => [r.id, r])).values()
            );
            const uniqueIssues = Array.from(
                new Map(scoredIssues.map(i => [i.id, i])).values()
            );

            setRepositories(matchingService.sortByScore(uniqueRepos, 20));
            setIssues(matchingService.sortByScore(uniqueIssues, 20));
        } catch (err) {
            setError(err as Error);
            setRepositories([]);
            setIssues([]);
        } finally {
            setLoading(false);
        }
    }, [preferences]);

    useEffect(() => {
        if (preferences.languages.length > 0) {
            fetchRecommendations();
        }
    }, [fetchRecommendations, preferences.languages.length]);

    return { repositories, issues, loading, error, refetch: fetchRecommendations };
}

export function useRateLimit() {
    const [rateLimit, setRateLimit] = useState({ limit: 5000, remaining: 5000, reset: 0 });
    const [loading, setLoading] = useState(false);

    const fetchRateLimit = useCallback(async () => {
        setLoading(true);
        try {
            const limit = await githubService.getRateLimit();
            setRateLimit(limit);
        } catch (err) {
            console.error('Failed to fetch rate limit:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRateLimit();
        const interval = setInterval(fetchRateLimit, 60000); // Update every minute
        return () => clearInterval(interval);
    }, [fetchRateLimit]);

    return { rateLimit, loading, refetch: fetchRateLimit };
}

export function useRepository(id: string | undefined) {
    const { preferences } = useUserPreferences();
    const [repository, setRepository] = useState<ScoredRepository | null>(null);
    const [issues, setIssues] = useState<ScoredIssue[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = useCallback(async () => {
        if (!id) return;

        setLoading(true);
        setError(null);

        try {
            // Fetch repository details
            const repoData = await githubService.getRepositoryById(Number(id));

            if (!repoData) {
                throw new Error('Repository not found');
            }

            // Fetch recent issues for this repo
            // We need to use the owner/repo name for the issues endpoint
            const issueData = await githubService.getRepositoryIssues(
                repoData.owner.login,
                repoData.name
            );

            // Score the repository and issues
            const scoredRepo = matchingService.scoreRepository(repoData, preferences);
            const scoredIssues = issueData.map(issue =>
                matchingService.scoreIssue(issue, preferences)
            );

            setRepository(scoredRepo);

            // Sort issues by match score
            setIssues(matchingService.sortByScore(scoredIssues, 10));

        } catch (err) {
            setError(err as Error);
            setRepository(null);
            setIssues([]);
        } finally {
            setLoading(false);
        }
    }, [id, preferences]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { repository, issues, loading, error, refetch: fetchData };
}
