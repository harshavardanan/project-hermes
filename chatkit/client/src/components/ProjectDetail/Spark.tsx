// Tiny sparkline SVG chart rendered inline in stat cards
const Spark = ({
  data,
  color = "#ffffff",
}: {
  data: number[];
  color?: string;
}) => {
  if (data.length < 2) return <div className="h-8" />;
  const max = Math.max(...data, 1);
  const W = 80,
    H = 32;
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * W},${H - (v / max) * H * 0.85}`)
    .join(" ");
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="block">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={pts}
        className="opacity-80"
      />
    </svg>
  );
};

export default Spark;
