import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-white/10',
        className
      )}
    />
  );
}

// Pre-built skeleton variants for common use cases

export function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div className={cn('space-y-3 p-4 rounded-lg bg-black/40 border border-white/10', className)}>
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-4 w-full" />
    </div>
  );
}

export function SkeletonText({ lines = 3, className }: SkeletonProps & { lines?: number }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          className={cn('h-4', i === lines - 1 ? 'w-2/3' : 'w-full')} 
        />
      ))}
    </div>
  );
}

export function SkeletonAvatar({ size = 'md', className }: SkeletonProps & { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };
  
  return (
    <Skeleton className={cn('rounded-full', sizeClasses[size], className)} />
  );
}

export function SkeletonButton({ className }: SkeletonProps) {
  return <Skeleton className={cn('h-10 w-24 rounded-md', className)} />;
}

export function SkeletonInput({ className }: SkeletonProps) {
  return <Skeleton className={cn('h-10 w-full rounded-md', className)} />;
}

// Composite Skeletons

export function SkeletonLotteryCard({ className }: SkeletonProps) {
  return (
    <div className={cn('p-6 rounded-xl bg-black/40 border border-white/10 space-y-4', className)}>
      <div className="flex items-center gap-3">
        <Skeleton className="h-12 w-12 rounded-lg" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-32" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonChatMessage({ className }: SkeletonProps) {
  return (
    <div className={cn('flex items-start gap-3 p-3', className)}>
      <SkeletonAvatar size="sm" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-12" />
        </div>
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

export function SkeletonChatList({ count = 5, className }: SkeletonProps & { count?: number }) {
  return (
    <div className={cn('space-y-1', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonChatMessage key={i} />
      ))}
    </div>
  );
}

export function SkeletonVideoPlayer({ className }: SkeletonProps) {
  return (
    <div className={cn('relative aspect-video rounded-lg overflow-hidden bg-black/60', className)}>
      <Skeleton className="absolute inset-0" />
      <div className="absolute inset-0 flex items-center justify-center">
        <Skeleton className="h-16 w-16 rounded-full" />
      </div>
    </div>
  );
}

export function SkeletonStatsGrid({ className }: SkeletonProps) {
  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-4 gap-4', className)}>
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonLotteryCard key={i} />
      ))}
    </div>
  );
}

export default Skeleton;
