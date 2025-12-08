export default function PieChart() {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-navy mb-6">Your Pie Chart</h3>

      <div className="flex items-center gap-8">
        {/* Chart SVG */}
        <div className="flex-shrink-0">
          <svg width="200" height="200" viewBox="0 0 200 200">
            {/* Circle background */}
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="2"
            />

            {/* Pie slices */}
            {/* Red slice - 25% */}
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="#EF4444"
              strokeWidth="40"
              strokeDasharray="125.66 502.65"
              strokeDashoffset="0"
              transform="rotate(-90 100 100)"
            />

            {/* Orange slice - 63% */}
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="#F97316"
              strokeWidth="40"
              strokeDasharray="316.9 502.65"
              strokeDashoffset="-125.66"
              transform="rotate(-90 100 100)"
            />

            {/* Yellow slice - 12% */}
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="#FBBF24"
              strokeWidth="40"
              strokeDasharray="60.32 502.65"
              strokeDashoffset="-442.56"
              transform="rotate(-90 100 100)"
            />
          </svg>
        </div>

        {/* Legend */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded bg-red-500"></div>
            <span className="text-sm text-gray-700">25%</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded bg-orange-500"></div>
            <span className="text-sm text-gray-700">63%</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded bg-amber-400"></div>
            <span className="text-sm text-gray-700">25%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
