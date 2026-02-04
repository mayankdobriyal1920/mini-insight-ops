type BadgeProps = {
  children: React.ReactNode;
  tone?: 'default' | 'info' | 'warning' | 'success';
  className?: string;
};

export function Badge({ children, tone = 'default', className = '' }: BadgeProps) {
  const styles: Record<string, string> = {
    default: 'bg-surface-muted text-foreground border border-border',
    info: 'bg-accent/10 text-accent border border-accent/40',
    warning: 'bg-amber-500/20 text-amber-100 border border-amber-400/40',
    success: 'bg-emerald-500/15 text-emerald-100 border border-emerald-400/40',
  };

  return (
    <span className={`rounded-full px-2 py-1 text-[12px] font-semibold ${styles[tone]} ${className}`}>
      {children}
    </span>
  );
}
