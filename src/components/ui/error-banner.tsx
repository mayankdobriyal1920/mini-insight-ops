type Props = {
  message: string;
  onRetry?: () => void;
};

export function ErrorBanner({ message, onRetry }: Props) {
  return (
    <div className="rounded-lg border border-red-400/70 bg-red-950/40 px-4 py-3 text-sm text-red-100">
      {message}
      {onRetry && (
        <>
          {' '}
          <button className="underline" onClick={onRetry}>
            Retry
          </button>
        </>
      )}
    </div>
  );
}
