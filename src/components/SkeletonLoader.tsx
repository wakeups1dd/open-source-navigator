export function RepositoryCardSkeleton() {
    return (
        <div className="brutal-card p-6 animate-pulse">
            <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-muted border-2 border-foreground" />
                <div className="flex-1">
                    <div className="h-5 bg-muted border-2 border-foreground w-3/4 mb-2" />
                    <div className="h-4 bg-muted border-2 border-foreground w-1/2" />
                </div>
            </div>
            <div className="space-y-2 mb-4">
                <div className="h-3 bg-muted border-2 border-foreground w-full" />
                <div className="h-3 bg-muted border-2 border-foreground w-5/6" />
            </div>
            <div className="flex gap-2">
                <div className="h-6 bg-muted border-2 border-foreground w-16" />
                <div className="h-6 bg-muted border-2 border-foreground w-20" />
                <div className="h-6 bg-muted border-2 border-foreground w-16" />
            </div>
        </div>
    );
}

export function IssueCardSkeleton() {
    return (
        <div className="brutal-card p-6 animate-pulse">
            <div className="flex items-start justify-between mb-3">
                <div className="h-5 bg-muted border-2 border-foreground w-2/3" />
                <div className="h-6 bg-muted border-2 border-foreground w-16" />
            </div>
            <div className="h-4 bg-muted border-2 border-foreground w-1/3 mb-4" />
            <div className="space-y-2 mb-4">
                <div className="h-3 bg-muted border-2 border-foreground w-full" />
                <div className="h-3 bg-muted border-2 border-foreground w-4/5" />
            </div>
            <div className="flex gap-2">
                <div className="h-6 bg-muted border-2 border-foreground w-20" />
                <div className="h-6 bg-muted border-2 border-foreground w-24" />
            </div>
        </div>
    );
}

export function DashboardSkeleton() {
    return (
        <div className="flex-1 p-8">
            {/* Header Skeleton */}
            <div className="mb-8 animate-pulse">
                <div className="h-8 bg-muted border-2 border-foreground w-64 mb-2" />
                <div className="h-4 bg-muted border-2 border-foreground w-48" />
            </div>

            {/* Skills Summary Skeleton */}
            <div className="brutal-card p-6 mb-8 animate-pulse">
                <div className="h-6 bg-muted border-2 border-foreground w-32 mb-4" />
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-8 bg-muted border-2 border-foreground w-20" />
                    ))}
                </div>
            </div>

            {/* Filters Skeleton */}
            <div className="flex gap-3 mb-8 animate-pulse">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-10 bg-muted border-2 border-foreground w-32" />
                ))}
            </div>

            {/* Content Grid Skeleton */}
            <div className="grid lg:grid-cols-2 gap-8">
                <div>
                    <div className="h-6 bg-muted border-2 border-foreground w-48 mb-6 animate-pulse" />
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <RepositoryCardSkeleton key={i} />
                        ))}
                    </div>
                </div>
                <div>
                    <div className="h-6 bg-muted border-2 border-foreground w-48 mb-6 animate-pulse" />
                    <div className="space-y-4">
                        {[1, 2, 3, 4].map(i => (
                            <IssueCardSkeleton key={i} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
