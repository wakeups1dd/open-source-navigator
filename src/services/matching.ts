import type { GitHubRepository, GitHubIssue } from './github';
import type { UserPreferences } from '@/types';

interface MatchScore {
    total: number;
    skillMatch: number;
    difficultyMatch: number;
    activityScore: number;
    popularityScore: number;
    freshnessScore: number;
    breakdown: string[];
}

interface ScoredRepository extends GitHubRepository {
    matchScore: MatchScore;
}

interface ScoredIssue extends GitHubIssue {
    matchScore: MatchScore;
    difficulty: 'easy' | 'medium' | 'hard';
    requiredSkills: string[];
    explanation: string;
    repository: {
        name: string;
        full_name: string;
    };
}

class MatchingService {
    // Calculate skill match score (0-40 points)
    private calculateSkillMatch(
        userSkills: string[],
        itemLanguage: string | null,
        itemTopics: string[] = [],
        requiredSkills: string[] = []
    ): { score: number; breakdown: string[] } {
        let score = 0;
        const breakdown: string[] = [];
        const normalizedUserSkills = userSkills.map(s => s.toLowerCase());

        // Direct language match (15 points)
        if (itemLanguage && normalizedUserSkills.includes(itemLanguage.toLowerCase())) {
            score += 15;
            breakdown.push(`Language match: ${itemLanguage}`);
        }

        // Topic/framework matches (up to 15 points)
        const topicMatches = itemTopics.filter(topic =>
            normalizedUserSkills.some(skill => topic.toLowerCase().includes(skill.toLowerCase()))
        );
        const topicScore = Math.min(topicMatches.length * 5, 15);
        score += topicScore;
        if (topicMatches.length > 0) {
            breakdown.push(`Topic matches: ${topicMatches.join(', ')}`);
        }

        // Required skills match (up to 10 points)
        if (requiredSkills.length > 0) {
            const skillMatches = requiredSkills.filter(skill =>
                normalizedUserSkills.some(userSkill =>
                    skill.toLowerCase().includes(userSkill.toLowerCase()) ||
                    userSkill.includes(skill.toLowerCase())
                )
            );
            const requiredScore = (skillMatches.length / requiredSkills.length) * 10;
            score += requiredScore;
            if (skillMatches.length > 0) {
                breakdown.push(`Required skills: ${skillMatches.join(', ')}`);
            }
        }

        return { score: Math.min(score, 40), breakdown };
    }

    // Calculate difficulty match (0-30 points)
    private calculateDifficultyMatch(
        experienceLevel: string,
        difficulty: 'easy' | 'medium' | 'hard'
    ): { score: number; breakdown: string[] } {
        const breakdown: string[] = [];
        let score = 0;

        const matchMap: Record<string, Record<string, number>> = {
            beginner: { easy: 30, medium: 15, hard: 5 },
            intermediate: { easy: 20, medium: 30, hard: 15 },
            advanced: { easy: 10, medium: 20, hard: 30 },
        };

        score = matchMap[experienceLevel]?.[difficulty] || 15;
        breakdown.push(`${experienceLevel} → ${difficulty} issue`);

        return { score, breakdown };
    }

    // Calculate activity score (0-15 points)
    private calculateActivityScore(
        updatedAt: string,
        openIssues: number
    ): { score: number; breakdown: string[] } {
        const breakdown: string[] = [];
        let score = 0;

        // Recent activity (up to 10 points)
        const daysSinceUpdate = (Date.now() - new Date(updatedAt).getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceUpdate < 7) {
            score += 10;
            breakdown.push('Very active (updated this week)');
        } else if (daysSinceUpdate < 30) {
            score += 7;
            breakdown.push('Active (updated this month)');
        } else if (daysSinceUpdate < 90) {
            score += 4;
            breakdown.push('Moderately active');
        }

        // Healthy issue count (up to 5 points)
        if (openIssues > 10 && openIssues < 500) {
            score += 5;
            breakdown.push('Healthy issue count');
        } else if (openIssues >= 500) {
            score += 2;
            breakdown.push('Many open issues');
        }

        return { score, breakdown };
    }

    // Calculate popularity score (0-10 points)
    private calculatePopularityScore(
        stars: number,
        forks: number
    ): { score: number; breakdown: string[] } {
        const breakdown: string[] = [];
        let score = 0;

        // Sweet spot: popular but not too popular
        if (stars >= 1000 && stars < 10000) {
            score += 7;
            breakdown.push('Well-established project');
        } else if (stars >= 10000 && stars < 50000) {
            score += 5;
            breakdown.push('Popular project');
        } else if (stars >= 100 && stars < 1000) {
            score += 4;
            breakdown.push('Growing project');
        } else if (stars >= 50000) {
            score += 3;
            breakdown.push('Very popular (competitive)');
        }

        // Active community
        if (forks > 100) {
            score += 3;
            breakdown.push('Active community');
        }

        return { score: Math.min(score, 10), breakdown };
    }

    // Calculate freshness score for issues (0-5 points)
    private calculateFreshnessScore(
        createdAt: string
    ): { score: number; breakdown: string[] } {
        const breakdown: string[] = [];
        const daysOld = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);

        let score = 0;
        if (daysOld < 7) {
            score = 5;
            breakdown.push('Fresh issue (< 1 week)');
        } else if (daysOld < 30) {
            score = 3;
            breakdown.push('Recent issue (< 1 month)');
        } else if (daysOld < 90) {
            score = 1;
            breakdown.push('Older issue');
        }

        return { score, breakdown };
    }

    // Determine issue difficulty from labels
    private determineIssueDifficulty(labels: Array<{ name: string }>): 'easy' | 'medium' | 'hard' {
        const labelNames = labels.map(l => l.name.toLowerCase());

        if (
            labelNames.some(l =>
                l.includes('good first issue') ||
                l.includes('beginner') ||
                l.includes('easy') ||
                l.includes('starter')
            )
        ) {
            return 'easy';
        }

        if (
            labelNames.some(l =>
                l.includes('hard') ||
                l.includes('complex') ||
                l.includes('advanced') ||
                l.includes('expert')
            )
        ) {
            return 'hard';
        }

        return 'medium';
    }

    // Extract required skills from issue
    private extractRequiredSkills(
        issue: GitHubIssue,
        repoLanguage: string | null
    ): string[] {
        const skills: string[] = [];

        if (repoLanguage) {
            skills.push(repoLanguage);
        }

        // Extract from labels
        issue.labels.forEach(label => {
            const name = label.name.toLowerCase();
            if (name.includes('typescript')) skills.push('TypeScript');
            if (name.includes('javascript')) skills.push('JavaScript');
            if (name.includes('python')) skills.push('Python');
            if (name.includes('react')) skills.push('React');
            if (name.includes('vue')) skills.push('Vue.js');
            if (name.includes('angular')) skills.push('Angular');
            if (name.includes('documentation')) skills.push('Technical Writing');
            if (name.includes('accessibility')) skills.push('ARIA');
            if (name.includes('api')) skills.push('API Design');
        });

        return [...new Set(skills)];
    }

    // Generate explanation for why issue is recommended
    private generateExplanation(
        issue: GitHubIssue,
        difficulty: 'easy' | 'medium' | 'hard',
        matchScore: MatchScore
    ): string {
        const reasons: string[] = [];

        if (difficulty === 'easy') {
            reasons.push('Great for beginners');
        } else if (difficulty === 'medium') {
            reasons.push('Good challenge for intermediate developers');
        } else {
            reasons.push('Complex task for experienced contributors');
        }

        if (matchScore.skillMatch > 25) {
            reasons.push('matches your skills well');
        }

        if (matchScore.freshnessScore > 3) {
            reasons.push('recently opened');
        }

        return reasons.join(', ') + '.';
    }

    // Score a repository
    scoreRepository(repo: GitHubRepository, preferences: UserPreferences): ScoredRepository {
        const allSkills = [...preferences.languages, ...preferences.frameworks];

        const skillResult = this.calculateSkillMatch(
            allSkills,
            repo.language,
            repo.topics
        );

        const activityResult = this.calculateActivityScore(
            repo.updated_at,
            repo.open_issues_count
        );

        const popularityResult = this.calculatePopularityScore(
            repo.stargazers_count,
            repo.forks_count
        );

        // Repositories don't have difficulty, so we give a base score
        const difficultyScore = 20;

        const total =
            skillResult.score +
            difficultyScore +
            activityResult.score +
            popularityResult.score;

        const matchScore: MatchScore = {
            total,
            skillMatch: skillResult.score,
            difficultyMatch: difficultyScore,
            activityScore: activityResult.score,
            popularityScore: popularityResult.score,
            freshnessScore: 0,
            breakdown: [
                ...skillResult.breakdown,
                ...activityResult.breakdown,
                ...popularityResult.breakdown,
            ],
        };

        return {
            ...repo,
            matchScore,
        };
    }

    // Score an issue
    scoreIssue(
        issue: GitHubIssue,
        preferences: UserPreferences,
        repoLanguage: string | null = null
    ): ScoredIssue {
        const allSkills = [...preferences.languages, ...preferences.frameworks];
        const difficulty = this.determineIssueDifficulty(issue.labels);
        const requiredSkills = this.extractRequiredSkills(issue, repoLanguage);

        const skillResult = this.calculateSkillMatch(
            allSkills,
            repoLanguage,
            [],
            requiredSkills
        );

        const difficultyResult = this.calculateDifficultyMatch(
            preferences.experienceLevel,
            difficulty
        );

        const freshnessResult = this.calculateFreshnessScore(issue.created_at);

        // Activity and popularity scores (simplified for issues)
        const activityScore = 10;
        const popularityScore = 5;

        const total =
            skillResult.score +
            difficultyResult.score +
            activityScore +
            popularityScore +
            freshnessResult.score;

        const matchScore: MatchScore = {
            total,
            skillMatch: skillResult.score,
            difficultyMatch: difficultyResult.score,
            activityScore,
            popularityScore,
            freshnessScore: freshnessResult.score,
            breakdown: [
                ...skillResult.breakdown,
                ...difficultyResult.breakdown,
                ...freshnessResult.breakdown,
            ],
        };

        const explanation = this.generateExplanation(issue, difficulty, matchScore);

        // Extract repository info from repository_url
        const repoUrlParts = issue.repository_url.split('/');
        const repoName = repoUrlParts[repoUrlParts.length - 1];
        const repoOwner = repoUrlParts[repoUrlParts.length - 2];

        return {
            ...issue,
            matchScore,
            difficulty,
            requiredSkills,
            explanation,
            repository: {
                name: repoName,
                full_name: `${repoOwner}/${repoName}`,
            },
        };
    }

    // Sort and filter scored items
    sortByScore<T extends { matchScore: MatchScore }>(items: T[], minScore: number = 30): T[] {
        return items
            .filter(item => item.matchScore.total >= minScore)
            .sort((a, b) => b.matchScore.total - a.matchScore.total);
    }
}

export const matchingService = new MatchingService();
export type { MatchScore, ScoredRepository, ScoredIssue };
