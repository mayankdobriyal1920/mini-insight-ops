import { ReactNode } from 'react';

type PanelProps = {
  title?: string;
  description?: string;
  action?: ReactNode;
  children?: ReactNode;
};

export function Panel({ title, description, action, children }: PanelProps) {
  return (
    <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
      {(title || description || action) && (
        <header className="mb-4 flex items-start justify-between gap-3">
          <div className="space-y-1">
            {title && <h2 className="text-base font-semibold text-foreground">{title}</h2>}
            {description && <p className="text-sm text-muted">{description}</p>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}
