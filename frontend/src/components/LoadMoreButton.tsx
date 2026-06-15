interface Props {
  loading: boolean;
  hasMore: boolean;
  onClick: () => void;
}

export function LoadMoreButton({ loading, hasMore, onClick }: Props) {
  if (!hasMore) return null;

  return (
    <div className="load-more-wrap">
      <button
        onClick={onClick}
        disabled={loading}
        aria-label="Load older messages"
        className="load-more-btn"
      >
        {loading ? (
          <>
            <span className="load-more-spinner" />
            Loading…
          </>
        ) : (
          <>
            <span style={{ fontSize: 12 }}>↑</span>
            Load older messages
          </>
        )}
      </button>
    </div>
  );
}
