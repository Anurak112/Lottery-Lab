/**
 * Shared Components - Reusable UI components
 * 
 * Import from this file for consistent component usage:
 * import { ErrorBoundary, Skeleton, Heading, Text } from '@/shared/components';
 */

// Error Handling
export { ErrorBoundary } from './ErrorBoundary';

// Loading States
export {
  Skeleton,
  SkeletonCard,
  SkeletonText,
  SkeletonAvatar,
  SkeletonButton,
  SkeletonInput,
  SkeletonLotteryCard,
  SkeletonChatMessage,
  SkeletonChatList,
  SkeletonVideoPlayer,
  SkeletonStatsGrid,
} from './Skeleton';

// Typography
export {
  Heading,
  Text,
  Label,
  Caption,
  BadgeText,
  NumberDisplay,
} from './Typography';
