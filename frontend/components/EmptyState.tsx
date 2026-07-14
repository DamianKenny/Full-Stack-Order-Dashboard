interface EmptyStateProps {
  status: string;
}

export default function EmptyState({ status }: EmptyStateProps) {
  return (
    <div className="border border-default rounded-xl bg-surface mx-8 py-16">
      <div className="text-center">
        <p className="text-sm text-secondary">
          No {status !== 'All' ? status.toLowerCase() : ''} orders right now.
        </p>
      </div>
    </div>
  );
}