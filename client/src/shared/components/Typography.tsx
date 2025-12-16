import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

// ============ Heading Component ============
interface HeadingProps {
  children: ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  color?: 'default' | 'muted' | 'primary' | 'secondary' | 'accent';
}

const headingSizes = {
  xs: 'text-sm',
  sm: 'text-base',
  md: 'text-lg',
  lg: 'text-xl',
  xl: 'text-2xl',
  '2xl': 'text-3xl',
  '3xl': 'text-4xl',
  '4xl': 'text-5xl',
};

const headingWeights = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
};

const headingColors = {
  default: 'text-white',
  muted: 'text-white/70',
  primary: 'text-neon-cyan',
  secondary: 'text-neon-purple',
  accent: 'text-neon-pink',
};

export function Heading({
  children,
  className,
  as: Component = 'h2',
  size = 'lg',
  weight = 'semibold',
  color = 'default',
}: HeadingProps) {
  return (
    <Component
      className={cn(
        headingSizes[size],
        headingWeights[weight],
        headingColors[color],
        'tracking-tight',
        className
      )}
    >
      {children}
    </Component>
  );
}

// ============ Text Component ============
interface TextProps {
  children: ReactNode;
  className?: string;
  as?: 'p' | 'span' | 'div' | 'label';
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  color?: 'default' | 'muted' | 'secondary' | 'primary' | 'success' | 'warning' | 'error';
  align?: 'left' | 'center' | 'right';
  truncate?: boolean;
}

const textSizes = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
};

const textWeights = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
};

const textColors = {
  default: 'text-white',
  muted: 'text-white/50',
  secondary: 'text-white/70',
  primary: 'text-neon-cyan',
  success: 'text-green-400',
  warning: 'text-yellow-400',
  error: 'text-red-400',
};

const textAligns = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

export function Text({
  children,
  className,
  as: Component = 'p',
  size = 'base',
  weight = 'normal',
  color = 'default',
  align = 'left',
  truncate = false,
}: TextProps) {
  return (
    <Component
      className={cn(
        textSizes[size],
        textWeights[weight],
        textColors[color],
        textAligns[align],
        truncate && 'truncate',
        className
      )}
    >
      {children}
    </Component>
  );
}

// ============ Label Component ============
interface LabelProps {
  children: ReactNode;
  className?: string;
  htmlFor?: string;
  required?: boolean;
}

export function Label({ children, className, htmlFor, required }: LabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        'text-sm font-medium text-white/70',
        className
      )}
    >
      {children}
      {required && <span className="text-red-400 ml-1">*</span>}
    </label>
  );
}

// ============ Caption Component ============
interface CaptionProps {
  children: ReactNode;
  className?: string;
  color?: 'default' | 'muted' | 'primary' | 'success' | 'warning' | 'error';
}

export function Caption({ children, className, color = 'muted' }: CaptionProps) {
  return (
    <span className={cn('text-xs', textColors[color], className)}>
      {children}
    </span>
  );
}

// ============ Badge Text Component ============
interface BadgeTextProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
}

const badgeVariants = {
  default: 'bg-white/10 text-white',
  primary: 'bg-neon-cyan/20 text-neon-cyan',
  secondary: 'bg-neon-purple/20 text-neon-purple',
  success: 'bg-green-500/20 text-green-400',
  warning: 'bg-yellow-500/20 text-yellow-400',
  error: 'bg-red-500/20 text-red-400',
};

export function BadgeText({ children, className, variant = 'default' }: BadgeTextProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
        badgeVariants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

// ============ Number Display Component ============
interface NumberDisplayProps {
  value: string | number;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  highlight?: boolean;
}

const numberSizes = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-3xl',
  xl: 'text-4xl',
};

export function NumberDisplay({ value, className, size = 'md', highlight = false }: NumberDisplayProps) {
  return (
    <span
      className={cn(
        'font-bold font-mono tracking-wider',
        numberSizes[size],
        highlight ? 'text-neon-cyan' : 'text-white',
        className
      )}
    >
      {value}
    </span>
  );
}

export default {
  Heading,
  Text,
  Label,
  Caption,
  BadgeText,
  NumberDisplay,
};
