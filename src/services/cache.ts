// Cache service for storing API responses with TTL
interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttl: number; // Time to live in milliseconds
}

class CacheService {
    private prefix = 'oss-compass-cache-';

    set<T>(key: string, data: T, ttlMinutes: number = 15): void {
        const entry: CacheEntry<T> = {
            data,
            timestamp: Date.now(),
            ttl: ttlMinutes * 60 * 1000,
        };

        try {
            localStorage.setItem(this.prefix + key, JSON.stringify(entry));
        } catch (error) {
            console.warn('Cache storage failed:', error);
            this.cleanup();
        }
    }

    get<T>(key: string): T | null {
        try {
            const item = localStorage.getItem(this.prefix + key);
            if (!item) return null;

            const entry: CacheEntry<T> = JSON.parse(item);
            const now = Date.now();

            // Check if cache is still valid
            if (now - entry.timestamp > entry.ttl) {
                this.delete(key);
                return null;
            }

            return entry.data;
        } catch (error) {
            console.warn('Cache retrieval failed:', error);
            return null;
        }
    }

    delete(key: string): void {
        localStorage.removeItem(this.prefix + key);
    }

    clear(): void {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith(this.prefix)) {
                localStorage.removeItem(key);
            }
        });
    }

    // Clean up old cache entries
    private cleanup(): void {
        const keys = Object.keys(localStorage);
        const cacheKeys = keys.filter(k => k.startsWith(this.prefix));

        // Remove oldest entries if storage is full
        if (cacheKeys.length > 50) {
            const entries = cacheKeys.map(key => ({
                key,
                timestamp: JSON.parse(localStorage.getItem(key) || '{}').timestamp || 0,
            }));

            entries.sort((a, b) => a.timestamp - b.timestamp);
            entries.slice(0, 10).forEach(entry => {
                localStorage.removeItem(entry.key);
            });
        }
    }
}

export const cache = new CacheService();
