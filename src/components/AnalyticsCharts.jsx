import React from 'react';

const DONUT_COLORS = ['#303BFA', '#7C85FF', '#B7BFFF', '#DDE2FF', '#CBD5E1'];

export function RecoveryLineChart({ series = [] }) {
  const width = 420;
  const height = 160;
  const padX = 24;
  const padY = 18;

  const data = series.length
    ? series
    : [
        { label: 'Mon', reports: 4, recoveries: 2 },
        { label: 'Tue', reports: 6, recoveries: 4 },
        { label: 'Wed', reports: 8, recoveries: 5 },
        { label: 'Thu', reports: 5, recoveries: 3 },
        { label: 'Fri', reports: 9, recoveries: 6 },
        { label: 'Sat', reports: 7, recoveries: 5 },
        { label: 'Sun', reports: 10, recoveries: 8 },
      ];

  const values = data.map((d) => Math.max(d.reports + d.recoveries, 0));
  const maxVal = Math.max(6, ...values);

  const points = data.map((d, idx) => {
    const x = padX + (idx * (width - padX * 2)) / Math.max(1, data.length - 1);
    const val = d.reports + d.recoveries;
    const y = height - padY - (val / maxVal) * (height - padY * 2);
    return { x, y, label: d.label, val };
  });

  const linePath = points
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${height - padY} L ${points[0].x.toFixed(1)} ${height - padY} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height + 24}`} className="w-full h-44 overflow-visible">
      <defs>
        <linearGradient id="recoveryFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#303BFA" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#303BFA" stopOpacity="0.01" />
        </linearGradient>
      </defs>

      {[0, 0.5, 1].map((t, i) => {
        const y = padY + t * (height - padY * 2);
        return (
          <line
            key={i}
            x1={padX}
            y1={y}
            x2={width - padX}
            y2={y}
            stroke="#E2E8F0"
            strokeDasharray="3 3"
          />
        );
      })}

      <path d={areaPath} fill="url(#recoveryFill)" />
      <path d={linePath} fill="none" stroke="#303BFA" strokeWidth="2.5" strokeLinecap="round" />

      {points.map((p, idx) => (
        <g key={idx}>
          <circle cx={p.x} cy={p.y} r="4" fill="#FFFFFF" stroke="#303BFA" strokeWidth="2.5" />
          <text
            x={p.x}
            y={height + 12}
            textAnchor="middle"
            className="fill-slate-400 text-[11px] font-medium"
          >
            {p.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function CategoryDonutChart({ categories = [], totalReports = 0 }) {
  const top = categories.slice(0, 5);
  const total = Math.max(
    1,
    top.reduce((sum, item) => sum + item.count, 0)
  );
  const radius = 44;
  const circumference = 2 * Math.PI * radius;

  let cumulativeOffset = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="#EEF1FA" strokeWidth="16" />
          {top.map((item, idx) => {
            const fraction = item.count / total;
            const dash = fraction * circumference;
            const offset = -cumulativeOffset;
            cumulativeOffset += dash;
            return (
              <circle
                key={item.category}
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke={DONUT_COLORS[idx % DONUT_COLORS.length]}
                strokeWidth="16"
                strokeDasharray={`${dash} ${circumference}`}
                strokeDashoffset={offset}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="font-sans font-semibold text-2xl text-[#11183B] tabular-nums leading-none">
            {totalReports}
          </span>
          <span className="text-[11px] text-slate-500 mt-1">Reports</span>
        </div>
      </div>

      <div className="flex-1 w-full space-y-2.5">
        {top.map((item, idx) => (
          <div key={item.category} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: DONUT_COLORS[idx % DONUT_COLORS.length] }}
              />
              <span className="text-[#11183B] font-medium truncate">{item.category}</span>
            </div>
            <span className="font-semibold text-[#11183B] tabular-nums ml-2">
              {item.percentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
