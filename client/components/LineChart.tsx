export default function LineChart() {
  const months = ["SEP", "OCT", "NOV", "DEC", "JAN", "FEB"];

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-navy">Engagement Trend</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
            FOCUS
          </span>
        </div>
      </div>

      <svg width="100%" height="300" viewBox="0 0 600 300" className="mb-4">
        {/* Grid lines */}
        <line x1="50" y1="250" x2="580" y2="250" stroke="#E5E7EB" strokeWidth="1" />
        <line x1="50" y1="200" x2="580" y2="200" stroke="#E5E7EB" strokeWidth="1" />
        <line x1="50" y1="150" x2="580" y2="150" stroke="#E5E7EB" strokeWidth="1" />
        <line x1="50" y1="100" x2="580" y2="100" stroke="#E5E7EB" strokeWidth="1" />
        <line x1="50" y1="50" x2="580" y2="50" stroke="#E5E7EB" strokeWidth="1" />

        {/* Axis */}
        <line x1="50" y1="30" x2="50" y2="280" stroke="#9CA3AF" strokeWidth="2" />
        <line x1="50" y1="280" x2="600" y2="280" stroke="#9CA3AF" strokeWidth="2" />

        {/* Red line - Engagements */}
        <polyline
          points="100,200 170,180 240,150 310,160 380,120 450,100"
          fill="none"
          stroke="#EF4444"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Blue line - Secondary metric */}
        <polyline
          points="100,240 170,220 240,210 310,220 380,200 450,180"
          fill="none"
          stroke="#3B82F6"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points for red line */}
        <circle cx="100" cy="200" r="4" fill="#EF4444" />
        <circle cx="170" cy="180" r="4" fill="#EF4444" />
        <circle cx="240" cy="150" r="4" fill="#EF4444" />
        <circle cx="310" cy="160" r="4" fill="#EF4444" />
        <circle cx="380" cy="120" r="4" fill="#EF4444" />
        <circle cx="450" cy="100" r="4" fill="#EF4444" />

        {/* Data points for blue line */}
        <circle cx="100" cy="240" r="4" fill="#3B82F6" />
        <circle cx="170" cy="220" r="4" fill="#3B82F6" />
        <circle cx="240" cy="210" r="4" fill="#3B82F6" />
        <circle cx="310" cy="220" r="4" fill="#3B82F6" />
        <circle cx="380" cy="200" r="4" fill="#3B82F6" />
        <circle cx="450" cy="180" r="4" fill="#3B82F6" />

        {/* Month labels */}
        {months.map((month, index) => {
          const x = 100 + index * 70;
          return (
            <text key={month} x={x} y="300" textAnchor="middle" fontSize="12" fill="#6B7280">
              {month}
            </text>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex gap-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span className="text-sm text-gray-600">Engagements</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span className="text-sm text-gray-600">Secondary</span>
        </div>
      </div>
    </div>
  );
}
