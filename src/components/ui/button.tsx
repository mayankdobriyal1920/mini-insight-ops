import React from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive';

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-accent text-surface hover:bg-accent-strong border border-accent',
  secondary:
    'border border-border bg-surface hover:border-accent text-foreground',
  ghost: 'text-foreground hover:text-accent',
  destructive:
    'border border-red-400/70 bg-red-500/20 text-red-100 hover:border-red-300',
};

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={`rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-60 disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
    />
  );
}
