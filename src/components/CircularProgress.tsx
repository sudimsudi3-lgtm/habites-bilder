import React from 'react';

interface CircularProgressProps {
  completed: number;
  total: number;
  percentage: number;
  size?: number;
  strokeWidth?: number;
  sublabel?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  completed,
  total,
  percentage,
  size = 148,
  strokeWidth = 12,
  sublabel = 'completed',
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * Math.min(100, Math.max(0, percentage))) / 100;

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#22D3EE" />
          </linearGradient>
        </defs>

        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#1F2637"
          strokeWidth={strokeWidth}
          fill="transparent"
        />

        {/* Progress stroke */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-500 ease-out"
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-3xl font-extrabold text-[#F3F4F6] tracking-tight tabular-nums">
          {percentage}%
        </span>
        <span className="text-xs font-medium text-[#9CA3AF] mt-0.5">
          <span className="text-[#A78BFA] font-bold">{completed}</span> / {total} {sublabel}
        </span>
      </div>
    </div>
  );
};
