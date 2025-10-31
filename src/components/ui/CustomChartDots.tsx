export const CustomTooltipArabic = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 text-right">
        <p className="font-semibold text-gray-800 mb-2">{label}</p>
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-4">
            <span className="font-medium text-gray-800">
              {payload[0].value}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">المجموعة 1</span>
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: '#5d24e1' }}
              ></div>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="font-medium text-gray-800">
              {payload[1].value}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">المجموعة 2</span>
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: '#8055e4' }}
              ></div>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="font-medium text-gray-800">
              {payload[2].value}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">المجموعة 3</span>
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: '#B08FFB' }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

// Custom Active Dot for when hovering
export const CustomActiveDot = (props: any) => {
  const { cx, cy, stroke } = props;

  return (
    <g>
      {/* Outer circle glow effect */}
      <circle
        cx={cx}
        cy={cy}
        r={8}
        fill="#d6c8f7"
        strokeWidth={2}
        opacity={0.8}
      />
      {/* Inner colored circle */}
      <circle
        cx={cx}
        cy={cy}
        r={4}
        fill="#5d24e1"
        stroke="white"
        strokeWidth={2}
      />
    </g>
  );
};
