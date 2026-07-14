interface EmptyStateProps {
  status: string;
}

export default function EmptyState({ status }: EmptyStateProps) {
  return (
    <div className="border rounded-xl bg-card mx-8 py-16">
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          No {status !== 'All' ? status.toLowerCase() : ''} orders right now.
        </p>
      </div>
    </div>
  );
}