type LoadingTextProps = {
  text: string;
  progress?: number;
};

export default function LoadingText({ text, progress }: LoadingTextProps) {
  const normalizedProgress =
    typeof progress === "number"
      ? Math.max(0, Math.min(100, Math.round(progress)))
      : undefined;

  return (
    <div className="benchmark-loading-wrap mt-3">
      <p className="benchmark-loading">
        <span className="spinner" />
        {text}
        {normalizedProgress !== undefined && (
          <span className="benchmark-progress-inline">
            {normalizedProgress}%
          </span>
        )}
      </p>
      {normalizedProgress !== undefined && (
        <div className="benchmark-progress-track" aria-hidden="true">
          <div
            className="benchmark-progress-bar"
            style={{ width: `${normalizedProgress}%` }}
          />
        </div>
      )}
    </div>
  );
}
