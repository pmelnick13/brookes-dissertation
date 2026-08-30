type ProbabilityChartProps = {
  probabilities: number[];
};

export default function ProbabilityChart({
  probabilities,
}: ProbabilityChartProps) {
  const chartWidth = 600;
  const chartHeight = 300;
  const leftSpace = 55;
  const rightSpace = 20;
  const topSpace = 20;
  const bottomSpace = 45;

  const graphWidth = chartWidth - leftSpace - rightSpace;
  const graphHeight = chartHeight - topSpace - bottomSpace;

  const points = probabilities.map((probability, index) => {
    const x =
      leftSpace +
      (index / (probabilities.length - 1)) * graphWidth;

    const y =
      topSpace +
      (1 - probability) * graphHeight;

    return { x, y, probability };
  });

  const linePoints = points
    .map((point) => `${point.x},${point.y}`)
    .join(" ");

  const percentageLines = [100, 75, 50, 25, 0];

  return (
    <div className="mb-4">
      <h3 className="h5">
        Win Probability by Parlay Leg
      </h3>

      <p className="text-muted">
        This chart shows how the chance of winning falls as each leg is added.
      </p>

      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="w-100 border rounded bg-white"
        role="img"
        aria-label="Chart showing cumulative win probability after each parlay leg"
      >
        {percentageLines.map((percentage) => {
          const y =
            topSpace +
            (1 - percentage / 100) * graphHeight;

          return (
            <g key={percentage}>
              <line
                x1={leftSpace}
                y1={y}
                x2={chartWidth - rightSpace}
                y2={y}
                stroke="#dee2e6"
              />

              <text
                x={leftSpace - 10}
                y={y + 5}
                textAnchor="end"
                fontSize="13"
                fill="#6c757d"
              >
                {percentage}%
              </text>
            </g>
          );
        })}

        <polyline
          points={linePoints}
          fill="none"
          stroke="#0d6efd"
          strokeWidth="3"
        />

        {points.map((point, index) => (
          <g key={index}>
            <circle
              cx={point.x}
              cy={point.y}
              r="6"
              fill="#0d6efd"
            />

            <text
              x={point.x}
              y={chartHeight - 18}
              textAnchor="middle"
              fontSize="13"
              fill="#212529"
            >
              Leg {index + 1}
            </text>

            <title>
              Leg {index + 1}: {(point.probability * 100).toFixed(2)}%
            </title>
          </g>
        ))}
      </svg>
    </div>
  );
}
