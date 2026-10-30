import React from 'react';

interface ScoreCircleProps {
  score: number;
  maxScore?: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  showPercent?: boolean;
  variant?: 'deep-violet' | 'dusty-plum' | 'warm-blush' | 'auto';
}

export const ScoreCircle: React.FC<ScoreCircleProps> = ({
  score,
  maxScore = 100,
  size = 120,
  strokeWidth = 10,
  label,
  sublabel,
  showPercent = false,
  variant = 'auto',
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((score / maxScore) * 100)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Violet Dusk palette colors
  let strokeColor = '#935073'; // Dusty Plum
  let badgeColor = 'bg-[#F6DBC0] text-[#502D55] border-[#935073]/20';
  let trackColor = '#F6DBC0';

  if (variant === 'deep-violet') {
    strokeColor = '#502D55';
    badgeColor = 'bg-[#502D55] text-[#F8F4E9] border-[#502D55]';
    trackColor = 'rgba(80, 45, 85, 0.15)';
  } else if (variant === 'warm-blush') {
    strokeColor = '#935073';
    badgeColor = 'bg-[#F6DBC0] text-[#502D55] border-[#935073]/30';
    trackColor = 'rgba(246, 219, 192, 0.5)';
  } else if (variant === 'dusty-plum') {
    strokeColor = '#935073';
    badgeColor = 'bg-[#935073]/15 text-[#502D55] border-[#935073]/30';
    trackColor = 'rgba(147, 80, 115, 0.15)';
  } else {
    // Auto variant based on percentage, strictly inside Violet Dusk
    if (percentage >= 80) {
      strokeColor = '#502D55'; // Deep Violet
      badgeColor = 'bg-[#935073] text-[#F8F4E9] border-[#502D55]/30';
      trackColor = 'rgba(147, 80, 115, 0.18)';
    } else if (percentage >= 60) {
      strokeColor = '#935073'; // Dusty Plum
      badgeColor = 'bg-[#F6DBC0] text-[#502D55] border-[#935073]/30';
      trackColor = 'rgba(246, 219, 192, 0.6)';
    } else {
      strokeColor = '#935073';
      badgeColor = 'bg-[#F6DBC0]/80 text-[#502D55] border-[#502D55]/20';
      trackColor = 'rgba(80, 45, 85, 0.12)';
    }
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={trackColor}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-extrabold text-[#502D55] tracking-tight">
            {score}{showPercent ? '%' : ''}
          </span>
          <span className="text-[10px] font-semibold text-[#935073]/70 uppercase tracking-wider">
            / {maxScore}
          </span>
        </div>
      </div>
      {label && (
        <span className="mt-2 text-sm font-semibold text-[#502D55] text-center">
          {label}
        </span>
      )}
      {sublabel && (
        <span className={`mt-1 text-xs px-2.5 py-0.5 rounded-full border font-semibold ${badgeColor}`}>
          {sublabel}
        </span>
      )}
    </div>
  );
};
