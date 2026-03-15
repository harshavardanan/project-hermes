// Horizontal progress bar used for usage statistics
const UsageBar = ({
  pct,
  color = "#ffffff",
}: {
  pct: number;
  color?: string;
}) => (
  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
    <div
      className="h-full rounded-full transition-all duration-1000 ease-out"
      style={{
        width: `${Math.min(pct, 100)}%`,
        background: color,
        boxShadow: `0 0 8px ${color}60`,
      }}
    />
  </div>
);

export default UsageBar;
