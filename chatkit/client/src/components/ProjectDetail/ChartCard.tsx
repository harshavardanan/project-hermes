interface ChartCardProps {
  title: string;
  data: number[];
  color: string;
  value: string;
}

// Full-width chart card with SVG polyline area chart
const ChartCard = ({ title, data, color, value }: ChartCardProps) => {
  const max = Math.max(...data, 1);
  const W = 400,
    H = 80;
  const pts =
    data.length > 1
      ? data
          .map(
            (v, i) =>
              `${(i / (data.length - 1)) * W},${H - (v / max) * H * 0.85}`,
          )
          .join(" ")
      : "";
  return (
    <div className="bg-[#111] border border-white/10 rounded-xl p-5 overflow-hidden">
      <div className="flex justify-between items-start mb-4">
        <div className="font-sans text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          {title}
        </div>
        <div className="font-mono text-sm font-bold" style={{ color }}>
          {value}
        </div>
      </div>
      {data.length > 1 ? (
        <svg
          width="100%"
          height={H}
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient
              id={`cg-${color.replace("#", "")}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor={color} stopOpacity="0.25" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <polyline
            fill={`url(#cg-${color.replace("#", "")})`}
            stroke="none"
            points={`0,${H} ${pts} ${W},${H}`}
          />
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={pts}
          />
        </svg>
      ) : (
        <div className="h-[80px] flex items-center justify-center font-sans text-xs font-medium text-slate-600">
          Waiting for analytics data...
        </div>
      )}
    </div>
  );
};

export default ChartCard;
